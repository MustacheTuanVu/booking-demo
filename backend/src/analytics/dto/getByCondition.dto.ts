import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from 'src/common/enum/status.enum';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { TypeBuy } from 'src/membership_logs/enum/type.enum';
import { OrderStatus } from 'src/orders/enum/status.enum';

export class GetAnalytics {
  @ApiProperty({
    description: 'Time from (start date)',
    required: false,
    example: '2024-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  time_from?: Date;

  @ApiProperty({
    description: 'Time to (end date)',
    required: false,
    example: '2024-10-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  time_to?: Date;

  @ApiProperty({
    description: 'Type',
    type: String,
    required: false,
    enum: TypeBuy,
    example: TypeBuy.ORDER,
  })
  @IsString()
  @IsEnum(TypeBuy, { message: '[ORDER, MEMBERSHIP]' })
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Status',
    type: String,
    required: false,
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsString()
  @IsEnum(OrderStatus, { message: '[PAID, ...]' })
  @IsOptional()
  status?: string;
}
