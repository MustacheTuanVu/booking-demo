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

export class CreateSeatMapDto {

    @ApiProperty({
        description: "Name of the seat map",
        type: String,
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "Seat map data",
        type: () => [SeatDataDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SeatDataDto) 
    data_seat: SeatDataDto[];
}
