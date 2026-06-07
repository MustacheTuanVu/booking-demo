import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateBankDto {

    @ApiProperty({
        description: 'Bank Code',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    bankCode: string;

    @ApiProperty({
        description: 'Bank Name',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    bankName: string;

    @ApiProperty({
        description: 'Account Number',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    accountNumber: string;

    @ApiProperty({
        description: 'Account Holder Name',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    accountHolderName: string;

}