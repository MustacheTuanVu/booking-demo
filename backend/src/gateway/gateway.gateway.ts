import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, ConnectedSocket, MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { jwtConstants } from 'src/auth/constants';
import { GatewayService } from './gateway.service';
import { ListenType, MsgType } from './enum/type.enum';
import { UserRole } from 'src/users/enum/role.enum';

@WebSocketGateway({ 
    cors: { origin: '*' }
})  // Không cần hardcode port
@Injectable()
export class GatewayWebSocket implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(GatewayWebSocket.name);

    @WebSocketServer()
    private server: Server;

    constructor(private readonly gatewayService: GatewayService) { }

    async handleConnection(@ConnectedSocket() client: Socket) {
        const decodedToken = await this.handleToken(client);
        const { query } = client.handshake
        console.log(1111, query)
        
        if (!decodedToken) {
            // client.disconnect(); // Ngắt kết nối nếu không có token hợp lệ
            return;
        }

        try {
            // const userUpdate = await this.gatewayService.updateIdSocketForUser(decodedToken.phone, client.id);
            const user = await this.gatewayService.findByPhone(decodedToken.phone);
            if(user.role === UserRole.ADMIN || user.role === UserRole.BOSS){ // <--- chỉ mỗi staff keme admin
                this.gatewayService.addInternalUser(client.id)
            }else{
                await this.gatewayService.addUserToEvent(query.event_id, query.showtimes_id, client.id)
                this.sendDataSeat(query.event_id, query.showtimes_id, client.id);
            }
            this.sendData(MsgType.INFO_USER, client.id, { message: 'Connected' });
            await this.gatewayService.addClient(client.id, client);
            this.logger.log(`Client connected: ${client.id}`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
        }
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        const { query } = client.handshake
        
        const decodedToken = await this.handleToken(client);
        if (!decodedToken) return;

        try {
            // const userUpdate = await this.gatewayService.deleteIdSocketForUser(decodedToken.phone, client.id);
            const user = await this.gatewayService.findByPhone(decodedToken.phone);
            if(user.role !== UserRole.USER){
                this.gatewayService.removeInternalUser(client.id);
            }else{
                await this.gatewayService.removeUserFromEvent(query.event_id, query.showtimes_id, client.id)
                this.logger.log(`Client disconnected: ${client.id}`);
            }
            await this.gatewayService.removeClient(client.id);
        } catch (error) {
            this.logger.error(`Disconnect error: ${error.message}`);
        }
    }

    private async handleToken(socket: Socket) {
        const token = socket.handshake.auth.token || this.extractToken(socket.handshake.headers.authorization);
        const userAgent = socket?.handshake?.headers['user-agent'];
        if (userAgent === 'arduino-WebSocket-Client') {
            console.log('User-Agent is arduino-WebSocket-Client');
            return null;
        } else {
            if (!token) {
                return null; // or throw an error if you prefer
            }

            try {
                const decodedToken: any = await verify(token, jwtConstants.secret);
                return decodedToken
            } catch (error) {
                console.error(error);
            }
        }

    }

    private extractToken(authorizationHeader?: string): string | null {
        if (!authorizationHeader) return null;
        const tokenMatch = authorizationHeader.match(/^Bearer\s(.+)$/);
        return tokenMatch ? tokenMatch[1] : authorizationHeader.trim();
    }

    @SubscribeMessage('newMessenger')
    async onNewMessenger(@MessageBody() body: any) {
        // this.server.emit('onMessenger', { msg: 'New Messenger', content: body });
        const data: any = JSON.parse(body);
        const { event_id, showtimes_id } = data.content;
        switch (data.type) {
            case ListenType.GET_SOCKET_ID:
                const skids = await this.gatewayService.getSocketIdEvents(event_id, showtimes_id);
                console.log(skids)
                break;
            case ListenType.DELETE_SKIO:
                const del = await this.gatewayService.deleteAllUsersInEvent(event_id, showtimes_id);
                console.log(del)
                break;
            default:
                break;
        }
    }

    sendData(type: MsgType, idSocketUser: string | string[], data: any) {
        if (Array.isArray(idSocketUser)) {
            idSocketUser.forEach(socketId => {
                this.server.to(socketId).emit('onMessenger', { msg: type, content: data });
                this.logger.log(`Data sent: ${type} to ${socketId}`);
            });
        } else {
            this.server.to(idSocketUser).emit('onMessenger', { msg: type, content: data });
            this.logger.log(`Data sent: ${type} to ${idSocketUser}`);
        }
    }

    async sendDataSeat(eventId, showtimeId, clientId?: string){
        const data = await this.gatewayService.getSeatEvent(eventId, showtimeId);
        if(clientId){
            await this.sendData(MsgType.INFO_SEAT_ORDER, clientId, data);
            return;
        }
        const skids = await this.gatewayService.getSocketIdEvents(eventId, showtimeId);
        console.log('Send socket ID', skids);
        await this.sendData(MsgType.INFO_SEAT_ORDER, skids, data)
    }
}
