import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDemoPaymentDto {
    @ApiProperty()
    @IsNumber()
    orderCode: number;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    returnUrl: string;

    @ApiProperty()
    @IsString()
    cancelUrl: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    memberType?: string;
}
