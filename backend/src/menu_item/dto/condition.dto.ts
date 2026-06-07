import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { PaginationDto } from "src/common/paging/paging.dto";
import { TypeItem } from "../enum/type.enum";


export class GetMenuItemByCondition extends PaginationDto{
    @ApiProperty({
        description: 'Status',
        type: String,
        required: false,
        enum: Status,
        example: Status.ACTIVE
    })
    @IsString()
    @IsEnum(Status, { message: 'status must be either ...' })
    @IsOptional()
    status: string;

    @ApiProperty({
        description: 'type',
        type: String,
        required: false,
        enum: TypeItem,
        example: TypeItem.FOOD
    })
    @IsString()
    @IsEnum(TypeItem, { message: 'type must be FOOD or DRINK' })
    @IsOptional()
    type: string;

    @ApiProperty({
        description: 'category id',
        type: String,
        required: false,
    })
    @IsString()
    @IsOptional()
    category_id: string;
}