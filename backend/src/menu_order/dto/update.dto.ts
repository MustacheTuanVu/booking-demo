import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { MenuOrderType } from "../enum/type.enum";
import { Status } from "src/common/enum/status.enum";

export class UpdateMenuOrderDto {
    // name of the menu
    @ApiProperty({description: 'name of the menu', type: String, required: false})
    @IsString()
    @IsOptional()
    @Length(3, 50)
    name: string;

    // description of the menu
    @ApiProperty({description: 'description of the menu', type: String, required: false})
    @IsString()
    @IsOptional()
    @Length(3, 300)
    description: string;

    //type of the menu
    @ApiProperty({
        description: 'type of the menu', 
        type: String,
        enum: MenuOrderType,
        default: MenuOrderType.COMBO,
        required: false
    })
    @IsString()
    @IsOptional()
    @IsEnum(MenuOrderType, {message: 'type must be COMBO or UPSALE'})
    type: string;

    // item aray id menu item
    @ApiProperty({description: 'item array id menu item', type: [String], required: false})
    @IsOptional()
    @IsString({each: true})
    items: string[];

    @ApiProperty({description: 'Status of the menu', type: String, enum: Status, default: Status.ACTIVE, required: false})
    @IsEnum(Status, {message: 'status must be either ACTIVE or INACTIVE'})
    @IsString()
    @IsOptional()
    status: string;
}