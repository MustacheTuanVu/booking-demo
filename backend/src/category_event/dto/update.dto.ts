import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Status } from "src/common/enum/status.enum";

export class UpdateCategory {
    @ApiProperty({
        description: 'name category',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    name: string

    @ApiProperty({
        description: 'slug category',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    slug: string

    @ApiProperty({
        description: 'Status',
        type: String,
        required: false,
        enum: Status,
        example: Status.ACTIVE
    })
    @IsString()
    @IsEnum(Status, { message: 'status must be either ...' })
    @IsOptional()
    status: string;
}