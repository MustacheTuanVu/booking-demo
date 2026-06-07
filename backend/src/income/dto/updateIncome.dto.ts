import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TypeIncome } from '../enum/type.enum';

export class UpdateIncomeDto {
  @ApiProperty({
    description: 'Name',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Desc',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  desc: string;

  @ApiProperty({
    description: 'type_price',
    type: String,
    enum: TypeIncome,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(TypeIncome, { message: 'TypeIncome ...' })
  type_price: string;

  @ApiProperty({
    description: 'Price',
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price: number;
}
