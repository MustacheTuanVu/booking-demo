import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { OrdersService } from 'src/orders/orders.service';
import { RuntimeStateService } from 'src/runtime-state/runtime-state.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GatewayService {
    private readonly logger = new Logger(GatewayService.name);
    private connectedClients: Map<string, Socket> = new Map();

    constructor(private readonly userService: UsersService,
                @Inject(forwardRef(() => OrdersService)) private readonly _orderService: OrdersService,
                private readonly runtimeStateService: RuntimeStateService
    ) {}

    async addClient(clientId: string, client: Socket) {
        this.connectedClients.set(clientId, client);
        this.logger.log(`Client added: ${clientId}`);
    }

    async removeClient(clientId: string) {
        this.connectedClients.delete(clientId);
        this.logger.log(`Client removed: ${clientId}`);
    }

    getClient(clientId: string): Socket | undefined {
        return this.connectedClients.get(clientId);
    }

    getAllClients(): Socket[] {
        return [...this.connectedClients.values()];
    }

    async updateIdSocketForUser(username: string, idSocket: string) {
        return await this.userService.updateIdSocketForUser(username, idSocket);
    }

    async findByPhone(username: string){
        return await this.userService.findByPhone(username)
    }

    async deleteIdSocketForUser(username: string, idSocket: string) {
        return await this.userService.deleteIdSocketForUser(username, idSocket);
    }

    async addUserToEvent(eventid, showtimeId, skid){
        return await this.runtimeStateService.addUserToEvent(`${eventid}_${showtimeId}`, skid);
    }

    async removeUserFromEvent(eventid, showtimeId, skid){
        return await this.runtimeStateService.removeUserFromEvent(`${eventid}_${showtimeId}`, skid);
    }

    async deleteAllUsersInEvent(eventid, showtimeId){
        return await this.runtimeStateService.deleteAllUserInEvent(`${eventid}_${showtimeId}`);
    }

    async getSocketIdInternal(){
        return await this.runtimeStateService.getUsersInternal();
    }

    async addInternalUser(skid){
        return await this.runtimeStateService.addUserInternal(skid);
    }

    async removeInternalUser(skid){
        return await this.runtimeStateService.deleteUserInternal(skid);
    }

    async deleteAllInternalUsers(){
        return await this.runtimeStateService.deleteAllUserInternal();
    }

    async getSocketIdEvents(eventid, showtimeId){
        return await this.runtimeStateService.getUsersInEvent(`${eventid}_${showtimeId}`);
    }

    async getSeatEvent(eventId, showtimeId){
        return await this._orderService.getSeatOrderEvent(eventId, showtimeId);
    }
}
