
import { Order_seatService } from './order_seat.service';
import { Control } from "src/common/meta/control.meta";

@Control('order_seat')
export class Order_seatController {
    constructor(private readonly _order_seatService: Order_seatService, ){}

}

