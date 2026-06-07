import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Length, Min, ValidateNested } from "class-validator";
import { TypePromotion } from "src/promotion/enum/type.enum";
import { OrderStatus } from "../enum/status.enum";
import { PaymentMethod } from "src/payment/enum/method.enum";
import { CreateOrderDetail } from "src/order_detail/dto/create.dto";
import { Type } from "class-transformer";
import { CreateOrderSeat } from "src/order_seat/dto/create.dto";

export class CreateOrder {

    @ApiProperty({
        description: 'event id',
        type: String,
    })
    @IsString()
    event_id: string

    @ApiProperty({
        description: 'seat id',
        type: String,
    })
    @IsString()
    seat_id: string

    @ApiProperty({
        description: 'showtimes id',
        type: String,
    })
    @IsOptional()
    @IsString()
    showtimes_id: string

    @ApiProperty({
        description: 'employee id',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    employee_id: string

    @ApiProperty({
        description: 'promotion object',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    promotion_code: string

    @ApiProperty({
        description: 'note',
        type: String,
        required: false
    })
    @IsOptional()
    @Length(3, 100)
    @IsString()
    note: string

    @ApiProperty({
        description: 'referred by code or phone',
        type: String,
        required: false
    })
    @IsOptional()
    @Length(3, 50)
    @IsString()
    referred_by: string

    @ApiProperty({
        description: 'status',
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    @IsEnum(OrderStatus, { message: 'status must be either ...' })
    @IsString()
    status: string

    @ApiProperty({
        description: "Order item",
        type: () => CreateOrderDetail
    })
    @ValidateNested()
    @Type(() => CreateOrderDetail)
    createOrderDetail: CreateOrderDetail;

    // @ApiProperty({
    //     description: "Order seats",
    //     isArray: true,
    //     type: CreateOrderSeat
    // })
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => CreateOrderSeat)
    // createOrderSeat: CreateOrderSeat[];

}