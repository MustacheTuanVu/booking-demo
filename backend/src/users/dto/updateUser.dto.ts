import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { GuestDto } from './guest.dto';

export class UpdateUserDto {
  @Length(3, 30)
  @ApiProperty({
    description: 'Ho Ten',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'email',
    type: String,
    required: false,
  })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'phone',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'password',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'address',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'identity_number',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  identity_number?: string;

  @ApiProperty({
    description: 'incom id',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  incom_id?: string;

  @ApiProperty({
    description: 'google id',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  google_id?: string;
}
