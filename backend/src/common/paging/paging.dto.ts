import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateIf,
  Min,
  IsDate,
} from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    required: true,
    description: 'page',
    example: 1,
  })
  @Min(1)
  @IsNumber()
  @Transform((obj) => (obj.value ? parseInt(obj.value, 10) : 1))
  page: number = 1;

  @ApiProperty({
    required: true,
    description: 'limit',
    example: 10,
  })
  @Min(1)
  @IsNumber()
  @Transform((obj) => (obj.value ? parseInt(obj.value, 10) : 10))
  limit: number = 10;
  
  @ApiProperty({
    required: false,
    default: '',
  })
  @IsOptional()
  orderBy?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsOptional()
  query?: string = '';

  @ApiProperty({
    description: 'Time from (start date)',
    required: false,
    example: '2024-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : null)
  time_from?: Date;

  @ApiProperty({
    description: 'Time to (end date)',
    required: false,
    example: '2024-10-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : null)
  time_to?: Date;

}
