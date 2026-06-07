import { StringUtils } from 'src/common/utils/string.utils';
import { CreateOrderSeat } from './dto/create.dto';
import { Order_seatRepo } from './order_seat.repo';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Seat_sectionService } from 'src/seat_section/seat_section.service';
import { MessageCode } from 'src/common/exception/MessageCode';

@Injectable()
export class Order_seatService {
    constructor(private readonly _order_seatRepo: Order_seatRepo,
        private readonly _seatSection: Seat_sectionService,
    ) { }

    async createOrderSeat(user, orderId, showtimeId, eventId, seatId, items: CreateOrderSeat[]) {
        // check seat, check price, check time
        const seatCode = items.map((value) => value.seat_id)
        let totalSeat = 0;

        const dataSeats = await this._seatSection.getDataBuySeat(eventId, seatId, seatCode)
        const seatsEvent = dataSeats.flatMap(seat =>
            seat.data_seat.map(data => ({
                ...data,
                price: seat.price
            }))
        );

        // check time
        for (const seat of dataSeats) {
            await this.validateSeatBooking(user, seat);
        }

        // check Seat Ordered
        // const seatOrdered = await this._orderService.findSeatBooking(eventId, showtimeId)
        // items.forEach(seat => {
        //     if (seatOrdered.some(item => item.seat_id === seat.seat_id)) {
        //         throw MessageCode.SEAT.SEAT_ALREADY_BOOKED
        //     }
        // })

        // check price seat in section seat
        const isValidOrder = items.every(item => {
            const matchedSeat = seatsEvent.find(eventSeat => eventSeat.id === item.seat_id);
            totalSeat += item.price;
            return matchedSeat && matchedSeat.price === item.price;
        });

        if (!isValidOrder) {
            throw MessageCode.SEAT.INVALID_SEAT;
        }
        //
        const data = items.map((value) => ({
            _id: StringUtils.generateObjectId(),
            order_id: StringUtils.ObjectId(orderId),
            price: value.price,
            ...(value.seat_cukcuk_id && { seat_cukcuk_id: value.seat_cukcuk_id }),
            seat_id: value.seat_id,
            name_seat: value.name_seat
        }))
        const seatItems = await this._order_seatRepo.createManyOrder_seat(data);
        return {
            seatItems,
            priceSeats: totalSeat
        }
    }

    prepareTheSeats(items) {
        let totalPrice = 0
        items.forEach(item => {
            totalPrice += item.price
        })
        return totalPrice
    }

    async validateSeatBooking(user: any, data: any) {
        const now = new Date();
        const customerType =
            user?.customer_type === 'VIP'
                ? 'K'
                : ['Regular', 'Guest'].includes(user?.customer_type)
                    ? 'J'
                    : user?.customer_type;
    
        // Nếu sự kiện đã kết thúc -> Ghế hết hạn
        // if (now > new Date(data.time_end)) {
        //     throw MessageCode.SEAT.SEAT_EXPIRED;
        // }
    
        // Map thời gian mở bán của từng loại ghế
        const bookingStartTimeMap = {
            K: new Date(data.k_booking_start),
            Q: new Date(data.q_booking_start),
            J: new Date(data.j_booking_start),
        };
    
        // Map loại khách có thể mua những loại ghế nào
        const allowedSeatTypes = {
            K: ['K', 'Q', 'J'],
            Q: ['K', 'Q', 'J'],
            J: ['K', 'Q', 'J'],
        };
    
        // Nếu user không có quyền mua loại ghế này -> Cấm
        if (!allowedSeatTypes[customerType]?.includes(data.type)) {
            throw MessageCode.SEAT.SEAT_NOT_FOUND;
        }
    
        const isKOpen = now >= bookingStartTimeMap.K;
        const isQOpen = now >= bookingStartTimeMap.Q;
        const isJOpen = now >= bookingStartTimeMap.J;
        console.log(customerType)
        // Kiểm tra loại khách hàng và điều kiện mở bán
        if (customerType === 'J') {
            // J phải chờ J mở bán, nếu K hoặc Q mở nhưng J chưa mở -> CẤM
            if (!isJOpen) {
                throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET;
            }
            // Nếu J mở bán mà Q & K cũng mở, có thể mua Q & K
            if (isQOpen && isKOpen) {
                return;
            }
        } else if (customerType === 'Q') {
            // Q phải chờ Q mở bán, nếu K mở nhưng Q chưa mở -> CẤM
            if (!isQOpen) {
                throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET;
            }
            // Nếu Q mở bán và K cũng mở, có thể mua K
            if (isKOpen) {
                return;
            }
        } else {
            // K thì không cần check gì thêm, chỉ cần 1 ghế mở là OK
            console.log(isKOpen)
            if (!isKOpen) {
                throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET;
            }
        }
    }
    
    

    async deleteOrderSeat(orderId){
        return await this._order_seatRepo.deleteOrderSeats({order_id: StringUtils.ObjectId(orderId)});
    }

    async getOrderSeatListByOrderId (order_id) {
        return await this._order_seatRepo.findOrder_seatByCondition({order_id})
    }
}

 
