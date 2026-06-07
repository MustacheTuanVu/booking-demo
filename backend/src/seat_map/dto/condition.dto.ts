import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { PaginationDto } from "src/common/paging/paging.dto";


export class GetSeatMapByCondition extends PaginationDto{
    // @ApiProperty({
    //     description: 'Status',
    //     type: String,
    //     required: false,
    //     enum: Status,
    //     example: Status.ACTIVE
    // })
    // @IsEnum(Status, { message: 'status must be either ...' })
    // @IsOptional()
    // @IsString()
    // status: string;
}