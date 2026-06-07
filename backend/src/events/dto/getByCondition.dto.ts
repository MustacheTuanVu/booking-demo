import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/paging/paging.dto";


export class GetEventByCondition extends PaginationDto{
    @ApiProperty({
        description: 'Id Ca sĩ',
        type: String,
        required: false,
    })
    @IsString()
    @IsOptional()
    artist_id: string;
}