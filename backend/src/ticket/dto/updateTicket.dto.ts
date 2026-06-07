import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { StatusTicket } from "../enum/status.enum";

export class UpdateTicketDto {

    @ApiProperty({
        description: 'Trang thai',
        type: String,
        enum: StatusTicket
    })
    @IsEnum(StatusTicket, {message: 'Status éc éc'})
    @IsString()
    status: string;

}