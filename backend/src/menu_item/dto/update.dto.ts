import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'src/common/enum/status.enum';
import { TypeItem } from '../enum/type.enum';
import { Flavor } from './flavor';

export class UpdateMenuItem {
  @ApiProperty({ description: 'name item', type: String, required: false })
  @IsString()
  @IsOptional()
  @Length(3, 50)
  name: string;

  @ApiProperty({ description: 'desc item', type: String, required: false })
  @IsString()
  @IsOptional()
  @Length(3, 300)
  desc: string;

  @ApiProperty({ description: 'ingredient item', type: String })
  @IsString()
  @IsOptional()
  ingredient: string;

  @ApiProperty({
    description: 'flavor item',
    type: () => [Flavor],
    required: false,
  })
  @IsArray()
  @IsOptional()
  flavor: Flavor[];

  @ApiProperty({
    description: 'category id item',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  category_id: string;

  @ApiProperty({
    description: 'type item',
    type: String,
    enum: TypeItem,
    default: TypeItem.FOOD,
  })
  @IsEnum(TypeItem, { message: 'type must be FOOD or DRINK' })
  @IsOptional()
  type: TypeItem;

  @ApiProperty({ description: 'unit item', type: String, required: false })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  unit: string;

  @ApiProperty({
    description: 'status item',
    type: String,
    enum: Status,
    default: Status.ACTIVE,
    required: false,
  })
  @IsEnum(Status, { message: 'status must be either ...' })
  @IsOptional()
  status: Status;

  @ApiProperty({
    description: 'price item',
    type: Number,
    default: 10000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1000)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'item_id_cukcuk', type: String, required: false })
  @IsString()
  @IsOptional()
  item_id_cukcuk: string;

  @ApiProperty({
    description: 'item_name_cukcuk',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  item_name_cukcuk: string;

  @ApiProperty({ description: 'unit_id_cukcuk', type: String, required: false })
  @IsString()
  @IsOptional()
  unit_id_cukcuk: string;

  @ApiProperty({
    description: 'unit_name_cukcuk',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  unit_name_cukcuk: string;
}
