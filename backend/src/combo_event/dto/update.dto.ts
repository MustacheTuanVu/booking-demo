import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Status } from "src/common/enum/status.enum";

export class UpdateComboEventDto {

    @ApiProperty({required: false, type: String})
    @IsString()
    @IsOptional()
    @Length(3, 50)
    name: string;

    @ApiProperty({required: false, type: Number})
    @IsNumber()
    @IsOptional()
    @Min(1)
    size_seat: number;

    @ApiProperty({required: false, type: Number})
    @IsNumber()
    @IsOptional()
    @Min(0)
    size_food: number;

    @ApiProperty({required: false, type: Number})
    @IsNumber()
    @IsOptional()
    @Min(0)
    size_drink: number;

    @ApiProperty({required: false, type: Number})
    @IsNumber()
    @IsOptional()
    @Min(0)
    price: number;

    @ApiProperty({required: false, type: Number})
    @IsNumber()
    @IsOptional()
    @Min(0)
    price_origin: number;

    @ApiProperty({required: false, type: String})
    @IsOptional()
    @IsString()
    menu_id: string;

    @ApiProperty({required: false, type: String, enum: Status, default: Status.ACTIVE})
    @IsEnum(Status, {message: `status must be a valid enum value`})
    @IsOptional()
    @IsString()
    status: string;

    @ApiProperty({required: false, type: Boolean})
    @IsOptional()
    @IsBoolean()
    is_show_upsell: boolean;

}