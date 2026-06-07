import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";
import { TypeTicket } from "../enum/type.enum";
import { IsMultipleOf1000 } from "../validate/is-multiple-of-1000";

export class CreateTicketDto {
    @ApiProperty({
        description: 'Loai',
        type: String,
        enum: TypeTicket
    })
    @IsString()
    type: string;

    @ApiProperty({
        description: 'Tieu de',
        type: String,
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Noi dung',
        type: Number,
    })
    @IsNumber()
    // @IsMultipleOf1000({ message: 'Price phải chia hết cho 1000' })
    price: string;
}