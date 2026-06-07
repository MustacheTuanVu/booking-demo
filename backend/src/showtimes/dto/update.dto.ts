import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateShowTimes {

    @ApiProperty({
        description: 'Showtime id',
        type: String
    })
    @IsString()
    showtimeId: string;

    @ApiProperty({
        description: 'Time Start',
        type: String,
        example: "2025-02-19T08:00:00Z",
        required: false
    })
    @IsString()
    @IsOptional()
    time_start: string;

    @ApiProperty({
        description: 'Time End',
        type: String,
        example: "2025-02-19T10:00:00Z",
        required: false
    })
    @IsString()
    @IsOptional()
    time_end: string;
}