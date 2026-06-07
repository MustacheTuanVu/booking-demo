import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length, Max, Min } from "class-validator";

export class CreateArtists {
    @ApiProperty({
        description: 'name artists',
        type: String,
    })
    @IsString()
    @Length(3, 40)
    name: string;

    @ApiProperty({
        description: 'bio artists',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    bio: string;

    @ApiProperty({
        description: 'slug to event',
        type: String,
    })
    @IsString()
    link: string;
}