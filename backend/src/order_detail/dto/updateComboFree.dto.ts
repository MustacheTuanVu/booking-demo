import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypeItem } from 'src/menu_item/enum/type.enum';

class ComboItem {
  @ApiProperty({ description: 'item id', type: String })
  @IsString()
  itemId: string;

  @ApiProperty({ description: 'quantity', type: Number })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'item name', type: String, required: false })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ description: 'item desc', type: String, required: false })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({
    description: 'item ingredient',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  ingredient?: string;

  //   @ApiProperty({ description: 'category_id', type: String, required: false })
  //   @IsOptional()
  //   @IsString()
  //   category_id?: string;

  @ApiProperty({ description: 'category name', type: String, required: false })
  @IsOptional()
  @IsString()
  category_name?: string;

  @ApiProperty({
    description: 'type',
    type: String,
    required: false,
    enum: TypeItem,
  })
  @IsOptional()
  @IsEnum(TypeItem, { message: 'Invalid type' })
  type?: string;

  @ApiProperty({ description: 'unit', type: String, required: false })
  @IsOptional()
  @IsString()
  unit?: string;

    @ApiProperty({ description: 'image', type: String, required: false })
    @IsOptional()
    @IsString()
    image?: string;

  @ApiProperty({ description: 'Price', type: Number, required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'code_cukcuk', type: String, required: false })
  @IsOptional()
  @IsString()
  code_cukcuk?: string;

  @ApiProperty({ description: 'item_id_cukcuk', type: String, required: false })
  @IsOptional()
  @IsString()
  item_id_cukcuk?: string;

  @ApiProperty({
    description: 'item_name_cukcuk',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  item_name_cukcuk?: string;
}

class ComboInfo {
  @ApiProperty({ description: 'combo id', type: String })
  @IsString()
  comboId: string;

  @ApiProperty({ description: 'combo id', type: String })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Price', type: Number, required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'size seat number', type: Number, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size_seat?: number;

  @ApiProperty({ description: 'size food number', type: Number, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size_food?: number;

  @ApiProperty({ description: 'size drink number', type: Number, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size_drink?: number;

  @ApiProperty({ description: 'Combo items', type: () => [ComboItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboItem)
  items: ComboItem[];
}

export class UpdateMenuFree {
  @ApiProperty({ description: 'Combo info', type: () => [ComboInfo] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboInfo)
  combo_info: ComboInfo[];
}
