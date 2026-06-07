import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, isNumber, IsNumber, IsString, Length, Min } from "class-validator";
import { TypeIncome } from "../enum/type.enum";

export class CreateIcomeDto {
    @ApiProperty({
        description: 'Name',
        type: String
    })
    @IsString()
    @Length(1)
    name: string;

    @ApiProperty({
        description: 'Desc',
        type: String,
    })
    @IsString()
    desc: string;

    @ApiProperty({
        description: 'type_price',
        type: String,
        enum: TypeIncome
    })
    @IsString()
    @IsEnum(TypeIncome, {message: 'TypeIncome ...'})
    type_price: string;

    @ApiProperty({
        description: 'Price',
        type: Number,
    })
    @Min(1)
    @IsNumber()
    price: number;
}