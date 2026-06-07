import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/paging/paging.dto";
import { UserStatus } from "src/users/enum/status.enum";
import { StatusTicket } from "../enum/status.enum";
import { TypeTicket } from "../enum/type.enum";

export class TicketCondition extends PaginationDto{
    @ApiProperty({
        description: 'Trạng thái',
        type: String,
        enum: StatusTicket,
        required: false,
    })
    @IsOptional()
    @IsString()
    status: string;

    @ApiProperty({
        description: 'Loại ticket',
        type: String,
        enum: TypeTicket,
        required: false,
    })
    @IsOptional()
    @IsString()
    type: string;
}