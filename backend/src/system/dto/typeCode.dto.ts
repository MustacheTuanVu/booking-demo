import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";
import { TypeCode } from "../enum/typeCode.enum";

export class TypeCodeDto {
    @ApiProperty({
        description: 'Danh gia',
        type: String,
        enum: TypeCode
    })
    @IsString()
    type: string;
}