import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { CustomerType } from "src/users/enum/type.enum";

class SeatDataDto {
    @ApiProperty({ description: "Seat name", type: String })
    @IsString()
    name: string;

    @ApiProperty({ description: "Seat ID", type: String })
    @IsString()
    id: string;

    @ApiProperty({ description: "Cukcuk ID", type: String, required: false })
    @IsOptional()
    @IsString()
    cukcuk_id: string;
}

export class CreateSeatSection {
    @ApiProperty({
        description: 'Size',
        type: Number,
    })
    @IsNumber()
    size: number;

    @ApiProperty({
        description: 'price',
        type: Number,
    })
    @IsNumber()
    price: number;

    @ApiProperty({
        description: `Type [${CustomerType}]`,
        type: String,
        enum: CustomerType,
        default: CustomerType.K
    })
    @IsString()
    type: number;

    @ApiProperty({
        description: "Seat map data",
        type: () => [SeatDataDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SeatDataDto)
    data_seat: SeatDataDto[];

    @ApiProperty({
        description: 'J booking start',
        type: String,
        example: "2025-02-19T08:00:00Z",
        required: false
    })
    @IsOptional()
    @IsString()
    j_booking_start: string;

    @ApiProperty({
        description: 'Q booking start',
        type: String,
        example: "2025-02-19T08:00:00Z",
        required: false
    })
    @IsOptional()
    @IsString()
    q_booking_start: string;

    @ApiProperty({
        description: 'K booking start',
        type: String,
        example: "2025-02-19T08:00:00Z",
        required: false
    })
    @IsOptional()
    @IsString()
    k_booking_start: string;

    @ApiProperty({
        description: 'G booking start',
        type: String,
        example: "2025-02-19T08:00:00Z",
        required: false
    })
    @IsOptional()
    @IsString()
    g_booking_start: string;

    @ApiProperty({
        description: 'End booking start',
        type: String,
        example: "2025-02-19T08:00:00Z",
    })
    @IsString()
    time_end: string;
}