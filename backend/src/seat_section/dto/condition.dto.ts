import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { PaginationDto } from "src/common/paging/paging.dto";


export class GetSeatSectionByCondition extends PaginationDto{
    @ApiProperty({
        description: 'Id event',
        type: String,
        required: false,
    })
    @IsString()
    @IsOptional()
    eventId: string;
}