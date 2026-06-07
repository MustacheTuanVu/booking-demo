import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Type } from "class-transformer";
import { Status } from "src/common/enum/status.enum";
import { TypeItem } from "../enum/type.enum";
import { Flavor } from "./flavor";

export class CreateMenuItem {
    @ApiProperty({ description: 'name item', type: String })
    @IsString()
    @Length(3, 50)
    name: string;

    @ApiProperty({ description: 'desc item', type: String })
    @IsString()
    @Length(3, 300)
    desc: string;

    @ApiProperty({ description: 'ingredient item', type: String, required: false })
    @IsString()
    @IsOptional()
    ingredient: string;

    @ApiProperty({
        description: 'flavor item',
        type: () => [Flavor],
        required: false
    })
    @IsArray()
    @IsOptional()
    flavor: Flavor[];

    @ApiProperty({ description: 'category id item', type: String })
    @IsString()
    category_id: string;

    @ApiProperty({ description: 'type item', enum: TypeItem, default: TypeItem.FOOD })
    @IsEnum(TypeItem, { message: 'type must be FOOD or DRINK' })
    type: TypeItem;

    @ApiProperty({ description: 'unit item', type: String })
    @IsString()
    @Length(1, 20)
    unit: string;

    @ApiProperty({ description: 'status item', enum: Status, default: Status.ACTIVE })
    @IsEnum(Status, { message: 'status must be either ...' })
    status: Status;

    @ApiProperty({ description: 'price item', type: Number, default: 10000 })
    @IsNumber()
    @IsOptional()
    @Min(1000)
    @Type(() => Number)
    price: number;

    @ApiProperty({ description: 'item_id_cukcuk', type: String, required: false })
    @IsString()
    @IsOptional()
    item_id_cukcuk: string;

    @ApiProperty({ description: 'item_name_cukcuk', type: String, required: false })
    @IsString()
    @IsOptional()
    item_name_cukcuk: string;

    @ApiProperty({ description: 'unit_id_cukcuk', type: String, required: false })
    @IsString()
    @IsOptional()
    unit_id_cukcuk: string;

    @ApiProperty({ description: 'unit_name_cukcuk', type: String, required: false })
    @IsString()
    @IsOptional()
    unit_name_cukcuk: string;
}
