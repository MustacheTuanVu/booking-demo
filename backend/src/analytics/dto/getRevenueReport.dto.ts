import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeBuy } from 'src/membership_logs/enum/type.enum';
import { TypeQuery } from '../enum/type.dto';

export class GetRevenueReportDto {
  @ApiProperty({
    description: 'Start date of the revenue report',
    required: false,
    example: '2024-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  startDate: Date;

  @ApiProperty({
    description: 'End date of the revenue report',
    required: false,
    example: '2024-10-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  endDate: Date;

  @ApiProperty({
    description: 'Staff or customer',
    required: false,
    example: '2024-10-31T23:59:59Z',
    enum: TypeQuery
  })
  @IsOptional()
  @IsEnum(TypeQuery, {message: 'Staff or customer'})
  type?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsOptional()
  query?: string = '';
}
