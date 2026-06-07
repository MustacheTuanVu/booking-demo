import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { CustomerType } from "src/users/enum/type.enum"

export class UpdatePriceMembership {

    @ApiProperty({
        description: 'Type',
        type: String,
        enum: CustomerType,
        default: CustomerType.Q,
        required: false
    })
    @IsEnum(CustomerType, {message: '[K, Q]'})
    @IsString()
    @IsOptional()
    type: string

    @ApiProperty({
        description: 'priceInMonth',
        type: Number,
        required: false
    })
    @IsNumber()
    @IsOptional()
    priceInMonth: number

    @ApiProperty({
        description: 'Duration (month or year)',
        type: String,
        enum: ['month', 'year'],
        required: false
    })
    @IsEnum(['month', 'year'], {message: '[month, year]'})
    @IsString()
    @IsOptional()
    duration: string
}