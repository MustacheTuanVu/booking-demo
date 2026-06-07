import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Length } from "class-validator";
import { MenuOrderType } from "../enum/type.enum";

export class CreateMenuOrderDto {
    // name of the menu
    @ApiProperty({description: 'name of the menu', type: String})
    @IsString()
    @Length(3, 50)
    name: string;

    // description of the menu
    @ApiProperty({description: 'description of the menu', type: String})
    @IsString()
    @Length(3, 300)
    description: string;

    //type of the menu
    @ApiProperty({
        description: 'type of the menu', 
        type: String,
        enum: MenuOrderType,
        default: MenuOrderType.COMBO
    })
    @IsString()
    @IsEnum(MenuOrderType, {message: 'type must be COMBO or UPSALE'})
    type: string;

    // item aray id menu item
    @ApiProperty({description: 'item array id menu item', type: [String]})
    @IsString({each: true})
    items: string[];
}