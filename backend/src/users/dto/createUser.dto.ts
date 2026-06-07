import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional, IsEmail, Matches, IsEnum } from 'class-validator';
import { UserRole } from '../enum/role.enum';
import { UserStatus } from '../enum/status.enum';
import { UserState } from '../enum/state.enum';
import { CustomerType } from '../enum/type.enum';

export class CreateUserDto {
    @ApiProperty({
        description: 'Phone number of the user',
        type: String,
    })
    @IsString()
    @Length(10, 10)
    @Matches(/^0\d{9}$/, { message: 'Phone number must start with 0 and contain only digits' })
    phone: string;

    @ApiProperty({
        description: 'Unique Cukcuk ID',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    cukcuk_id: string;

    @ApiProperty({
        description: 'Full name of the user',
        type: String,
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Email address of the user',
        type: String,
        example: 'example@gmail.com',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({
        description: 'Address of the user',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        description: 'Identity number of the user',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    identity_number?: string;

    // @ApiProperty({
    //     description: 'Customer type of the user',
    //     type: String,
    //     enum: CustomerType,
    //     default: CustomerType.J,
    // })
    // @IsString()
    // customer_type: CustomerType;

    @ApiProperty({
        description: 'Password for the user',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    password: string;

    @ApiProperty({
        description: 'Status user',
        type: String,
        enum: UserStatus,
        default: UserStatus.NOT_VERIFY,
        required: false
    })
    @IsEnum(UserStatus)
    @IsString()
    @IsOptional()
    status?: string;
}
