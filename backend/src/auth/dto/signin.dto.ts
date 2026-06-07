import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class SignInDto{
    @ApiProperty({ 
        description: 'phone',
        type : String,
    })
    @IsString()
    phone: string;

    @ApiProperty({ 
        description: 'password',
        type: String,
    })
    @IsString()
    password : string;
}