import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class CreateOrderSeat {
    @ApiProperty({
        description: 'seat id',
        type: String,
    })
    @IsString()
    seat_id: string

    @ApiProperty({
        description: 'price seat',
        type: Number,
    })
    @IsNumber()
    price: number

    @ApiProperty({
        description: 'name seat',
        type: String,
    })
    @IsString()
    name_seat: string

    @ApiProperty({
        description: 'unit name cukcuk',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    seat_cukcuk_id: string
}