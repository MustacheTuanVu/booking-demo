import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length, Max } from "class-validator";
import { Status } from "src/common/enum/status.enum";

export class UpdateContentEvent {

    @ApiProperty({
        description: 'id content event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    content_id: string;

    @ApiProperty({
        description: 'artist_id event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    artist_id: string;

    @ApiProperty({
        description: 'desc music event',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    @Length(3, 300)
    desc: string;

    @ApiProperty({
        description: 'Time start',
        type: String,
        example: "2025-02-19T08:00:00Z",
        required: false
    })
    @IsOptional()
    @IsString()
    time: string;

    @ApiProperty({
        description: 'Status content event',
        type: String,
        enum: Status,
        default: Status.ACTIVE,
        required: false
    })
    @IsOptional()
    @IsString()
    status: string;
}