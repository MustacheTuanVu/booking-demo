import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethod } from "../enum/method.enum";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "src/orders/enum/status.enum";

export class CreatePayment {

    @ApiProperty({
        description: 'event id',
        type: String,
    })
    @IsString()
    order_id: string

    @ApiProperty({
        description: 'payment method',
        type: String,
        enum: PaymentMethod,
        example: PaymentMethod.CASH
    })
    @IsEnum(PaymentMethod, { message: 'status must be either ...' })
    @IsString()
    payment_method: string;

    @ApiProperty({
        description: 'code',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    code?: string

    @ApiProperty({
        description: 'bank',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    bank?: string

    @ApiProperty({
        description: 'status',
        type: String,
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    @IsEnum(OrderStatus, { message: 'status must be either ...' })
    @IsString()
    status?: string

    @ApiProperty({
        description: 'note',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    note?: string

     @ApiProperty({
            description: 'amount',
            type: Number,
        })
    @IsNumber()
    amount: number;
}