import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { PaginationDto } from "src/common/paging/paging.dto";
import { OrderStatus } from "../enum/status.enum";


export class GetOrderByCondition extends PaginationDto{
    @ApiProperty({
        description: 'Status',
        type: String,
        required: false,
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    @IsString()
    @IsEnum(OrderStatus, { message: 'status must be either ...' })
    @IsOptional()
    status: string;

    @ApiProperty({
        description: 'phone',
        type: String,
        required: false,
    })
    @IsString()
    @IsOptional()
    phone: string;

    @ApiProperty({
        description: 'name',
        type: String,
        required: false,
    })
    @IsString()
    @IsOptional()
    name: string;
}