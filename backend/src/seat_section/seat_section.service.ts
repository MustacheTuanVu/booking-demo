import { ObjectId } from 'mongoose';
import { Seat_sectionRepo } from './seat_section.repo';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { CreateSeatSection } from './dto/create.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { MessageCode } from 'src/common/exception/MessageCode';
import { CustomerType } from 'src/users/enum/type.enum';
import { UpdateSeatSection } from './dto/update.dto';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class Seat_sectionService {
    constructor(private readonly _seat_sectionRepo: Seat_sectionRepo,
                 @Inject(forwardRef(() => OrdersService)) private readonly _orderService: OrdersService
    ) { }

    async createManySeat_section(eventId: string, seatId: string ,createSeatSection: CreateSeatSection[]) {

        // check vip phải trước thời gian thường
        for (const section of createSeatSection) {
            const kStart = new Date(section.k_booking_start);
            const qStart = new Date(section.q_booking_start);
            const jStart = new Date(section.j_booking_start);

            // if (qStart <= kStart) {
            //     throw MessageCode.TIME.INVALID_TIME;
            // }
        
            // if (jStart <= qStart) {
            //     throw MessageCode.TIME.INVALID_TIME;
            // }
        }
        //

        const data = createSeatSection.map((value) => ({
            _id: StringUtils.generateObjectId(),
            event_id: StringUtils.ObjectId(eventId),
            seat_id: StringUtils.ObjectId(seatId),
            size: value.size,
            price: value.price,
            type: value.type,
            data_seat: value.data_seat,
            j_booking_start: value.j_booking_start,
            q_booking_start: value.q_booking_start,
            k_booking_start: value.k_booking_start,
            ... (value.g_booking_start && {g_booking_start: value.g_booking_start}),
            time_end: value.time_end
        }));

        return await this._seat_sectionRepo.createManySeat_section(data);
    }

    async updateSeat_section( seatMapId, updateSeatSection: UpdateSeatSection[]) {

        // check vip phải trước thời gian thường
        for (const section of updateSeatSection) {
            const kStart = new Date(section.k_booking_start);
            const qStart = new Date(section.q_booking_start);
            const jStart = new Date(section.j_booking_start);

            // if (kStart >= qStart) {
            //     throw MessageCode.TIME.INVALID_TIME;
            // }
        
            // if (qStart >= jStart) {
            //     throw MessageCode.TIME.INVALID_TIME;
            // }
        }
        //
        const updatedSections = await Promise.all(
            updateSeatSection.map(async (value) => {
                const data = {
                    ...(value.seat_id && { seat_id:StringUtils.ObjectId(seatMapId)}),
                    ...(value.size && { size: value.size }),
                    ...(value.price && { price: value.price }),
                    ...(value.type && { type: value.type }),
                    ...(value.data_seat && { data_seat: value.data_seat }),
                    ...(value.j_booking_start && { j_booking_start: value.j_booking_start }),
                    ...(value.q_booking_start && { q_booking_start: value.q_booking_start }),
                    ...(value.k_booking_start && { k_booking_start: value.k_booking_start }),
                    ...(value.time_end && { time_end: value.time_end }),
                };
                return this._seat_sectionRepo.updateSeat_section(value.seatSectionId, data);
            })
        );
        return updatedSections;
    }


    async getDataBuySeat(eventId, seatId, codeSeats) {

        const data = await this._seat_sectionRepo.findSeat_sectionByCondition(
            {
                event_id: StringUtils.ObjectId(eventId),
                seat_id: StringUtils.ObjectId(seatId),
                 'data_seat.id': {$in: codeSeats},
            }
        )

        if (!data || data.length === 0) {
            throw MessageCode.SEAT.SEAT_NOT_FOUND
        }
        return data
    }

    async getSeatSectionByCondition(condition){
        return await this._seat_sectionRepo.getSeatSectionByCondition(condition);
    }

    async getSeatSectionById(seatMapId){
        return await this._seat_sectionRepo.findSeat_sectionById(seatMapId);
    }

    async getSizeSeat(eventId) {
        // Giới hạn cứng cho số ghế tối đa
        const maxSeats = {
            'J': 78,
            'Q': 56,
            'K': 54
        };
        
        // Lấy dữ liệu về số ghế đã đặt
        const dataOrder = await this._orderService.findSeatBooking(eventId);
        const limits = { J: "j_size", Q: "q_size", K: "k_size" };
        
        const remainingSeats: Record<string, number> = {};
        
        // Tính số ghế còn lại dựa trên giới hạn cứng
        Object.entries(maxSeats).forEach(([key, value]) => {
            const sizeKey = limits[key];
            const booked = dataOrder[sizeKey] || 0;
            
            if (booked > value) {
                console.log(
                    `Ghế ${key} vượt giới hạn! Cho phép: ${value}, Đặt: ${booked}`,
                );
            }
            
            const remaining = value - booked;
            remainingSeats[key] = remaining;
        });
        
        return remainingSeats;
    }

    async getSeatListByCondition(condition){
        return await this._seat_sectionRepo.findSeat_sectionByCondition(condition);
    }

    async getOneSeatListByCondition(condition){
        return await this._seat_sectionRepo.findOneSeat_sectionByCondition(condition);
    }

    async updateSeat_sectionById(id, data) {
        return await this._seat_sectionRepo.updateSeat_sectionById(id, data)
    }

    async deleteSeatSelection(eventId){
        return await this._seat_sectionRepo.deleteSeat_sectionByEvents(eventId);
    }
}

