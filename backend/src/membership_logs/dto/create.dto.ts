import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { TypeBuy } from "../enum/type.enum"

export class CreateBuy {
    @ApiProperty({
        description: 'idUser',
        type: String,
    })
    @IsString()
    uid: string

    @ApiProperty({
        description: 'Type',
        type: String,
        enum: TypeBuy,
        default: TypeBuy.MEMBERSHIP
    })
    @IsEnum(TypeBuy, {message: '[ORDER, MEMBERSHIP]'})
    @IsString()
    type: string

    @ApiProperty({
        description: 'price',
        type: Number,
    })
    @IsNumber()
    price: number
}