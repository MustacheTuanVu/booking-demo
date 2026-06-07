import { Body, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { Combo_eventService } from './combo_event.service';
import { Control } from "src/common/meta/control.meta";
import { CreateComboEventDto } from './dto/create.dto';
import { Description } from 'src/common/meta/description.meta';
import { UpdateComboEventDto } from './dto/update.dto';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { GetComboEventByCondition } from './dto/condition.dto';

@Control('combo_event')
export class Combo_eventController {
    constructor(private readonly _combo_eventService: Combo_eventService, ){}

    @Get('getDetailComboID')
    @Description('Lấy thông tin Combo Event', [{status: 200, description: 'Create successfully'}])
    async getDetailComboID(@Query('id') id: string){
        return await this._combo_eventService.getDetailComboEvent(id);
    }

    @Get('GetByCondition')
    @Description('Lấy thông tin Combo Event', [{status: 200, description: 'Create successfully'}])
    async GetByCondition(@Query() condition: GetComboEventByCondition){
        return await this._combo_eventService.getComboEventByCondition(condition);
    }

    @Post('Create')
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Description('Tạo một combo event mới', [{status: 200, description: 'Create successfully'}])
    async createComboEvent(@Body() data: CreateComboEventDto){
        return await this._combo_eventService.createComboEvent(data);
    }

    @Put('Update')
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Description('Update Combo Event', [{status: 200, description: 'Update successfully'}])
    async updateComboEvent(@Query('id') id: string ,@Body() data: UpdateComboEventDto){
        return await this._combo_eventService.updateComboEvent(id, data);
    }

    @Delete('Delete')
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Description('Delete Combo Event', [{status: 200, description: 'Delete successfully'}])
    async deleteComboEvent(@Query('id') id: string){
        return await this._combo_eventService.deleteComboEvent(id);
    }
}

