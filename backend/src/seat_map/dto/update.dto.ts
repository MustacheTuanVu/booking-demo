import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

class SeatDataDto {
    @ApiProperty({ description: "Seat name", type: String })
    @IsString()
    name: string;

    @ApiProperty({ description: "Seat ID", type: String })
    @IsString()
    id: string;

    @ApiProperty({ description: "Cukcuk ID", type: String, required: false })
    @IsString()
    @IsOptional()
    cukcuk_id: string;
}

export class UpdateSeatMapDto {

    @ApiProperty({
        description: "Name of the seat map",
        type: String,
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "Seat map data",
        type: () => [SeatDataDto],
        required: false
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SeatDataDto) 
    data_seat: SeatDataDto[];
}
