import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { TypePromotion } from "../enum/type.enum";
import { CustomerType } from "src/users/enum/type.enum";


export class UpdatePromotion {

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
        required: false
    })
    @IsString()
    @Length(3, 50)
    @IsOptional()
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
        required: false
    })
    @IsString()
    @IsOptional()
    expired: string;

    @ApiProperty({
        description: 'status promotion',
        type: String,
        enum: Status,
        default: Status.ACTIVE,
        required: false
    })
    @IsEnum(Status, { message: 'type_price must be either...' })
    @IsString()
    @IsOptional()
    status: string

    @ApiProperty({
        description: 'type price promotion',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    type_price: string

    @ApiProperty({
        description: 'price promotion',
        type: Number,
        default: 1,
        required: false
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    price: number

    @ApiProperty({
        description: 'required points promotion',
        type: Number,
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    required_points: number

    @ApiProperty({
        description: 'required points promotion',
        type: String,
        enum: CustomerType,
        default: CustomerType.J,
        required: false
    })
    @IsEnum(CustomerType, { message: 'type_price must be either...' })
    @IsOptional()
    for: string

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
        required: false
    })
    @IsString()
    @IsOptional()
    for_type: string;
    
    @ApiProperty({
        description: 'List of user IDs for specific customer promotions',
        type: [String],
        required: false
    })
    @IsOptional()
    @IsArray()
    user_list: string[];

}