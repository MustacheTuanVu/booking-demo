import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { CustomerType } from "src/users/enum/type.enum"

export class CreatecPriceMembership {

    @ApiProperty({
        description: 'Type',
        type: String,
        enum: CustomerType,
        default: CustomerType.Q
    })
    @IsEnum(CustomerType, {message: '[K, Q]'})
    @IsString()
    type: string

    @ApiProperty({
        description: 'priceInMonth',
        type: Number,
    })
    @IsNumber()
    priceInMonth: number
}