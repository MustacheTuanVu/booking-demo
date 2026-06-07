import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class BuyPromotion {
    @ApiProperty({
        description: 'Promotion id',
        type: String,
        required: false,
    })
    @IsString()
    promotionId: string;
}