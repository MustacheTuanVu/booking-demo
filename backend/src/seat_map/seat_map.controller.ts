import { Roles } from 'src/common/meta/role.meta';
import { Seat_mapService } from './seat_map.service';
import { Control } from "src/common/meta/control.meta";
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateSeatMapDto } from './dto/create.dto';
import { GetSeatMapByCondition } from './dto/condition.dto';
import { UpdateSeatMapDto } from './dto/update.dto';

@Control('seat_map')
export class Seat_mapController {
    constructor(private readonly _seat_mapService: Seat_mapService,) { }


    @Get('GetMany')
    @Description('Lấy thông tin seat map by condition', [{ status: 200, description: 'Create successfully' }])
    async getSeatMapByCondition(@Query() condition: GetSeatMapByCondition) {
        return await this._seat_mapService.getSeatMapByCondition(condition);
    }

    @Get('GetById/:id')
    @Description('Lấy thông tin categorie theo id', [{ status: 200, description: 'Create successfully' }])
    async getSeatMapById(@Param('id') id: string) {
        return await this._seat_mapService.getSeatMapById(id);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('Create')
    @Description('Tạo một seat map mới', [{ status: 200, description: 'Create successfully' }])
    async createSeatMap(@Body() createSeatMapDto: CreateSeatMapDto) {
        return await this._seat_mapService.createSeatMap(createSeatMapDto);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Put('Update')
    @Description('Cập nhật seat map', [{ status: 200, description: 'Create successfully' }])
    async updateSeatMap(@Query('id') id: string ,@Body() updateSeatMapDto: UpdateSeatMapDto) {
        return await this._seat_mapService.updateSeatMap(id, updateSeatMapDto);
    }
}

