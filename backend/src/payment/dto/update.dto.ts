import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethod } from "../enum/method.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "src/orders/enum/status.enum";

export class UpdatePayment {

    @ApiProperty({
        description: 'payment method',
        type: String,
        enum: PaymentMethod,
        example: PaymentMethod.CASH,
        required: false
    })
    @IsEnum(PaymentMethod, { message: 'status must be either ...' })
    @IsString()
    @IsOptional()
    payment_method: string;

    @ApiProperty({
        description: 'code',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    code: string

    @ApiProperty({
        description: 'bank',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    bank: string

    @ApiProperty({
        description: 'status',
        type: String,
        enum: OrderStatus,
        example: OrderStatus.PENDING,
        required: false
    })
    @IsEnum(OrderStatus, { message: 'status must be either ...' })
    @IsString()
    @IsOptional()
    status: string

    @ApiProperty({
        description: 'note',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    note: string
}