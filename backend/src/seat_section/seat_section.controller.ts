import { Description } from 'src/common/meta/description.meta';
import { Seat_sectionService } from './seat_section.service';
import { Control } from "src/common/meta/control.meta";
import { Get, Param, Query } from '@nestjs/common';
import { GetSeatSectionByCondition } from './dto/condition.dto';

@Control('seat_section')
export class Seat_sectionController {
    constructor(private readonly _seat_sectionService: Seat_sectionService,) { }

    @Get('GetMany')
    @Description('Lấy thông tin seat map by condition', [{ status: 200, description: 'Create successfully' }])
    async getSeatSectionByCondition(@Query() condition: GetSeatSectionByCondition) {
        return await this._seat_sectionService.getSeatSectionByCondition(condition);
    }

    @Get('GetById/:seatSectionId')
    @Description('Lấy thông tin seat map theo id', [{ status: 200, description: 'Create successfully' }])
    async getSeatSectionBySeatId(@Param('seatSectionId') seatSectionId: string) {
        return await this._seat_sectionService.getSeatSectionById(seatSectionId);
    }

    @Get('GetSizeSeat/:eventId')
    @Description('Lấy tổng số ghế theo sự kiện', [{ status: 200, description: 'Create successfully' }])
    async getSizeSeat(@Param('eventId') eventId: string) {
        return await this._seat_sectionService.getSizeSeat(eventId);
    }
}