import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { TypePromotion } from "../enum/type.enum";
import { CustomerType } from "src/users/enum/type.enum";


export class CreatePromotion {

    @ApiProperty({
        description: 'code promotion',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    code: string

    @ApiProperty({
        description: 'uid promotion',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    uid: string

    @ApiProperty({
        description: 'code promotion',
        type: String,
    })
    @IsString()
    @Length(3, 50)
    name: string

    @ApiProperty({
        description: 'code promotion',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    @Length(3, 100)
    desc: string

    @ApiProperty({
        description: 'expired',
        type: String,
        example: "2025-02-19T10:00:00Z",
    })
    @IsString()
    expired: string;

    @ApiProperty({
        description: 'status promotion',
        type: String,
        enum: Status,
        default: Status.ACTIVE
    })
    @IsEnum(Status, { message: 'type_price must be either...' })
    @IsString()
    status: string

    @ApiProperty({
        description: 'type price promotion',
        type: String,
        enum: TypePromotion,
        default: TypePromotion.PERCENT
    })
    @IsEnum(TypePromotion, { message: 'type_price must be either PERCENT or VND' })
    @IsString()
    type_price: string

    @ApiProperty({
        description: 'price promotion',
        type: Number,
        default: 1
    })
    @IsNumber()
    @Min(1)
    price: number

    @ApiProperty({
        description: 'required points promotion',
        type: Number,
    })
    @IsNumber()
    @Min(0)
    required_points: number

    @ApiProperty({
        description: 'max_quantity promotion',
        type: Number,
        default: 1
    })
    @IsNumber()
    @Min(1)
    max_quantity: number

    @ApiProperty({
        description: 'Type of promotion target',
        type: String,
        enum: ['Hạng thẻ', 'CTV', 'ALL', 'Khách hàng cụ thể'],
        required: true
    })
    @IsString()
    for_type: string;

    @ApiProperty({
        description: 'List of user IDs for specific customer promotions',
        type: [String],
        required: false
    })
    @IsOptional()
    @IsArray()
    user_list: string[];

    @ApiProperty({
        description: 'Card rank (J, Q, K) if for_type is "Hạng thẻ"',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    for: string;

}