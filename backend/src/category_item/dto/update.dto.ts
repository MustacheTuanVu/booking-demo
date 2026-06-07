import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCategoryItem {
    @ApiProperty({
        description: 'name category',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    name: string

    @ApiProperty({
        description: 'code category',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    code: string

    @ApiProperty({
        description: 'slug category',
        type: String, 
        required: false
    })
    @IsOptional()
    @IsString()
    slug: string

    @ApiProperty({
        description: 'category id cukcuk',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    category_id_cukcuk: string

    @ApiProperty({
        description: 'category name cukcuk',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    category_name_cukcuk: string
}