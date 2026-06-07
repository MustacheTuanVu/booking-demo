import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class ForgotPassDto{
    @ApiProperty({ 
        description: 'phone',
        type : String,
    })
    @IsString()
    @Length(10,10)
    phone: string;

    @ApiProperty({ 
        description: 'old password',
        type: String,
    })
    @IsString()
    old_password : string;

    @ApiProperty({ 
        description: 'new password',
        type: String,
    })
    @IsString()
    new_password : string;
}