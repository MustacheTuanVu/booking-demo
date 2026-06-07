import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { UserStatus } from "../enum/status.enum";

export class ChangeStatus{

    @ApiProperty({ 
        description: 'UserID',
        type : String,
    })
    @IsString()
    userId: string;


    @ApiProperty({ 
        description: 'Status user',
        type : String,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    @IsEnum(UserStatus)
    @IsString()
    status: string;

}
