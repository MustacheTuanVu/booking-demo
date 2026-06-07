import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class PhoneDto {
  @ApiProperty({
    description: 'Phone',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  phone?: string;

  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    example: 'example@gmail.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
}
