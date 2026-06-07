import { Roles } from 'src/common/meta/role.meta';
import { TicketService } from './ticket.service';
import { Control } from "src/common/meta/control.meta";
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Get, Post, Put, Query } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { User } from 'src/common/meta/user.meta';
import { CreateTicketDto } from './dto/createTicket.dto';
import { UpdateTicketDto } from './dto/updateTicket.dto';
import { TicketCondition } from './dto/condition.dto';

@Control('ticket')
export class TicketController {
    constructor(private readonly _ticketService: TicketService, ){}

    @Roles(UserRole.BOSS, UserRole.ADMIN, UserRole.USER)
    @Post('createTicket')
    @Description('Tạo ticket mới', [{ status: 200, description: 'Create successfully' }])
    async createTicket(
        @User() username, 
        @Body() createTicketDto: CreateTicketDto
    ) {
        return await this._ticketService.createTicket(username, createTicketDto);
    }

    @Roles(UserRole.BOSS, UserRole.ADMIN)
    @Put('updateStatusTicker')
    @Description('Update Status ticket ', [{ status: 200, description: 'Update successfully' }])
    async updateStatusTicket(@User() username, @Query('id') id: string , @Body() updateStatus: UpdateTicketDto) {
        return await this._ticketService.updateStatusTicket(username, id, updateStatus);
    }

    @Roles(UserRole.BOSS, UserRole.ADMIN, UserRole.USER)
    @Get('getTicketsByCondition')
    @Description('Lấy ticket theo điểu kiện ', [{ status: 200, description: 'Get successfully' }])
    async getTicketsByCondition(@User() username, @Query() condition: TicketCondition) {
        return await this._ticketService.getTicketsByCondition(username, condition);
    }

    @Roles(UserRole.BOSS, UserRole.ADMIN, UserRole.USER)
    @Get('getInfoTicket')
    @Description('Lấy ticket thông tin ticket ', [{ status: 200, description: 'Get successfully' }])
    async getInfoTicketByID(@User() username, @Query('id') id: string) {
        return await this._ticketService.getInfoTicketByID(username, id);
    }
}

