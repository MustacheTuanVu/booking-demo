import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateURLDto {
    @ApiProperty({
        description: 'Giá tiền cần thanh toán',
        type: Number,
    })
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'Id của order',
        type: String,
    })
    @IsString()
    orderId: string
}
 