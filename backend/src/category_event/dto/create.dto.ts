import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategory {
    @ApiProperty({
        description: 'name category',
        type: String,
    })
    @IsString()
    name: string

    @ApiProperty({
        description: 'slug category',
        type: String,
    })
    @IsString()
    slug: string
}