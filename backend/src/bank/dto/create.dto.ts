import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class CreateBankDto {
    @ApiProperty({
        description: 'Bank Code',
        type: String,
    })
    @IsString()
    bankCode: string;

    @ApiProperty({
        description: 'Bank Name',
        type: String,
    })
    @IsString()
    bankName: string;

    @ApiProperty({
        description: 'Account Number',
        type: String,
    })
    @IsString()
    accountNumber: string;

    @ApiProperty({
        description: 'Account Holder Name',
        type: String,
    })
    @IsString()
    accountHolderName: string;
}