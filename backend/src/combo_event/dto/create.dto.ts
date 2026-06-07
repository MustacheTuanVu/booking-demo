import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Status } from "src/common/enum/status.enum";

export class CreateComboEventDto {

    @ApiProperty({required: true, type: String})
    @IsString()
    @Length(3, 50)
    name: string;

    @ApiProperty({required: true, type: Number})
    @IsNumber()
    @Min(1)
    size_seat: number;

    @ApiProperty({required: true, type: Number})
    @IsNumber()
    @Min(0)
    size_food: number;

    @ApiProperty({required: true, type: Number})
    @IsNumber()
    @Min(0)
    size_drink: number;

    @ApiProperty({required: true, type: Number})
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({required: true, type: String})
    @IsString()
    menu_id: string;

    @ApiProperty({required: true, type: String, enum: Status, default: Status.ACTIVE})
    @IsEnum(Status, {message: `status must be a valid enum value`})
    @IsString()
    status: string;

    @ApiProperty({required: false, type: Number})
    @IsNumber()
    @IsOptional()
    @Min(0)
    price_origin: number;

    @ApiProperty({required: false, type: Boolean, default: true})
    @IsOptional()
    @IsBoolean()
    is_show_upsell: boolean;
}