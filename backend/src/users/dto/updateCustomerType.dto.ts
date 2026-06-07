import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { CustomerType } from "../enum/type.enum";

export class UpdateCustomerType{
    @Length(3, 30)
    @ApiProperty({
        description: 'uid',
        type: String
    })
    @IsString()
    uid: string;

    @ApiProperty({ 
        description: 'add count time (in months or years, depending on duration)',
        type : Number,
    })
    @Min(1)
    @IsNumber()
    time: number;

    @ApiProperty({ 
        description: 'id price membership',
        type : String,
    })
    @IsString()
    priceMemberShipId: string;

}
