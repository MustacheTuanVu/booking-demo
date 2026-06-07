import {
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckDemoOtpDto {
    @ApiProperty({ example: '0987654321' })
    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: string;

    @ApiProperty({ example: '12345' })
    @IsNotEmpty()
    @IsString()
    otp: string;

    @ApiPropertyOptional({ example: 'example@gmail.com' })
    @IsOptional()
    @IsString()
    email?: string;
}
