import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateShowTimes {
    @ApiProperty({
        description: 'Time Start',
        type: String,
        example: "2025-02-19T08:00:00Z",
    })
    @IsString()
    time_start: string;

    @ApiProperty({
        description: 'Time End',
        type: String,
        example: "2025-02-19T10:00:00Z",
    })
    @IsString()
    time_end: string;
}