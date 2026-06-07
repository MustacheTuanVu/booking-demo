import { UsersService } from 'src/users/users.service';
import { CreateTicketDto } from './dto/createTicket.dto';
import { TicketRepo } from './ticket.repo';
import { Injectable, Logger } from '@nestjs/common';
import { StringUtils } from 'src/common/utils/string.utils';
import { StatusTicket } from './enum/status.enum';
import { UpdateTicketDto } from './dto/updateTicket.dto';
import { MessageCode } from 'src/common/exception/MessageCode';
import { UserRole } from 'src/users/enum/role.enum';
import { TicketCondition } from './dto/condition.dto';
import { TypeTicket } from './enum/type.enum';
import { MailerService } from 'src/mailer/mailer.service';
import { UserModel } from 'src/users/model/user.model';
import { SystemService } from 'src/system/system.service';

@Injectable()
export class TicketService {
    private readonly logger = new Logger(TicketService.name);

    constructor(
        private readonly _ticketRepo: TicketRepo,
        private readonly _userService: UsersService,
        private readonly _mailerService: MailerService,
        private readonly _systemService: SystemService
    ) {}

    async createTicket(username: string, createTicketDto: CreateTicketDto) {
        const user = await this._userService.findByPhone(username);

        const id = StringUtils.generateObjectId();

        if (createTicketDto.type === TypeTicket.COMPLAINTS) {
            const point = Number(createTicketDto.price) / 1000;
            if (user.point - point <= 0) throw MessageCode.POINT.POINTS_NOT_ENOUGH;
        }

        const data = {
            _id: id,
            uid: user._id,
            type: createTicketDto.type,
            // for: createTicketDto.for,
            title: createTicketDto.title,
            price: createTicketDto.price,
            // status: StatusTicket.PENDING,
        };
        
        const ticket = await this._ticketRepo.createTicket(data);
        
        // Send Telegram notification for CTV registration
        if (createTicketDto.type === TypeTicket.COLLABORATOR) {
            try {
                await this._systemService.sendCTVRequestNotification(ticket, user);
            } catch (error) {
                this.logger.error('Failed to send CTV Telegram notification:', error);
                // Don't throw - notification failure shouldn't break ticket creation
            }
        }
        
        return ticket;
    }

    async getTicketById(id: string): Promise<any> {
        return await this._ticketRepo.findTicketById(id);
    }

    async updateStatusTicket(username: string, id: string, data: UpdateTicketDto) {
        const ticket = await this._ticketRepo.findTicketById(id);
        const user = await this._userService.findById(ticket.uid);
        const userHandel = await this._userService.findByPhone(username);
        // chuyển từ vnd sang điểm
        const point = Number(ticket.price) / 1000;
        if (ticket.type === TypeTicket.COMPLAINTS) {
            if (user.point - point <= 0) throw MessageCode.POINT.POINTS_NOT_ENOUGH;
        }
        //
        const dataUpdate = {
            handler_id: userHandel._id,
            status: data.status,
        };

        let ticketUpdate = null;

        if (data.status === StatusTicket.COMPLETE) {
            (ticketUpdate = await this._ticketRepo.updateTicket(id, dataUpdate)),
                await this._userService.updatePointUser(user._id, -point);
        } else {
            ticketUpdate = await this._ticketRepo.updateTicket(id, dataUpdate);
        }

        if (data.status === StatusTicket.COMPLETE) {
            const userModel = new UserModel(user);
            this._mailerService.sendEmailTicketStatus(user.email, userModel, ticketUpdate, true);
        } else if (data.status === StatusTicket.CANCEL) {
            const userModel = new UserModel(user);
            this._mailerService.sendEmailTicketStatus(user.email, userModel, ticketUpdate, false);
        }

        return ticketUpdate;
    }

    async checkOwnerTicket(username, ticketID) {
        const userOwner = await this._userService.findByPhone(username);
        if (!userOwner) {
            throw MessageCode.USER.NOT_FOUND;
        }

        const ticket = await this._ticketRepo.ownerTicket(ticketID, userOwner._id);
        console.log(ticket);
        if (ticket) {
            return true;
        }
        return false;
    }

    async getTicketsByCondition(username, condition: TicketCondition) {
        // vcc code
        const user = await this._userService.findByPhone(username);
        if (user.role === UserRole.USER) {
            return await this._ticketRepo.getTicketsByCondition(condition, user._id);
        }
        return await this._ticketRepo.getTicketsByCondition(condition);
    }

    async getInfoTicketByID(username, id) {
        const checkOwner = await this.checkOwnerTicket(username, id);
        if (!checkOwner) {
            throw MessageCode.ROLE.ROLE_IS_NOT_PERMISSION;
        }

        return await this._ticketRepo.getInfoTicketByID(id);
    }
}
