import { Control } from 'src/common/meta/control.meta';
import { EventsService } from './events.service';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Delete, Get, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateEventDto } from './dto/create.dto';
import { CreateShowTimes } from 'src/showtimes/dto/create.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiMultiFile } from 'src/common/meta/upload-multi-file.meta';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/meta/public.meta';
import { GetEventByCondition } from './dto/getByCondition.dto';
import { UpdateEventDto } from './dto/update.dto';

@Control('events')
export class EventsController {
    constructor(private readonly _eventService: EventsService){}

    @Get('getEventByCondition')
    @Public()
    @Description('Lấy thông tin event theo điều kiện' , [{status: 200, description: 'get successfully'}])
    async getEventByCondition(@Query() query: GetEventByCondition){
        return await this._eventService.getEventByCondition(query);
    }

    @Get('getDetailEvent')
    @Public()
    @Description('Lấy chi tiết thông tin event' , [{status: 200, description: 'get successfully'}])
    async getDetailEvent(@Query('idEvent') idEvent: string){
        return await this._eventService.getDetailEvent(idEvent);
    }

    @Get('getDetailEventBySlug')
    @Public()
    @Description('Lấy chi tiết thông tin event' , [{status: 200, description: 'get successfully'}])
    async getDetailEventBySlug(@Query('slug') slug: string){
        return await this._eventService.getDetailEventBySlug(slug);
    }

    @Post('Create')
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Description('Tạo event mới' , [{status: 200, description: 'create successfully'}])
    async createEvent(@Body() createEvent: CreateEventDto){
        return await this._eventService.createEvent(createEvent);
    }

    @Put('Update')
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Description('Update event' , [{status: 200, description: 'update successfully'}])
    async updateEvent(@Query('eventId') eventId: string, @Body() updateEvent: UpdateEventDto){
        return await this._eventService.updateEvent(eventId, updateEvent);
    }

    @Put('updateImages')
    // @Roles(UserRole.ADMIN, UserRole.BOSS)
    @ApiConsumes('multipart/form-data')
    @ApiMultiFile({ name: 'files', isArray: true })
    @UseInterceptors(FilesInterceptor('files', 2))
    @Description('Cập nhật banner và logo', [{ status: 200, description: 'Update successfully' }])
    async updateImages(@Query('eventId') eventId: string, @UploadedFiles() files){
        return await this._eventService.updateImage(eventId, files);
    }

    @Delete('Delete')
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Description('Delete event' , [{status: 200, description: 'update successfully'}])
    async deleteEvent(@Query('eventId') eventId: string){
        return await this._eventService.deleteEvent(eventId);
    }

}
