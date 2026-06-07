import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, IsOptional, IsEmail, Matches, Max, IsNumber, IsArray, IsObject, ValidateNested, IsEnum, IsBoolean } from "class-validator";
import { TypeEvent } from "../enum/type.enum";
import { Status } from "src/common/enum/status.enum";
import { CustomerType } from "src/users/enum/type.enum";
import { CreateShowTimes } from "src/showtimes/dto/create.dto";
import { Transform, Type } from "class-transformer";
import { CreateContentEvent } from "src/content_event/dto/create.dto";
import { CreateSeatSection } from "src/seat_section/dto/create.dto";
import { UpdateShowTimes } from "src/showtimes/dto/update.dto";
import { UpdateContentEvent } from "src/content_event/dto/update.dto";
import { UpdateSeatSection } from "src/seat_section/dto/update.dto";

export class UpdateEventDto {
    @ApiProperty({
        description: 'Title event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(3, 50)
    title: string;

    @ApiProperty({
        description: 'Type event [Online, Offline]',
        type: String,
        enum: TypeEvent,
        example: TypeEvent.OFFLINE,
        required: false
    })
    @IsOptional()
    @IsEnum(TypeEvent, { message: 'status must be either ...' })
    @IsString()
    type_event: string;

    @ApiProperty({
        description: 'Address event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    venue: string;

    @ApiProperty({
        description: 'category event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    category_id: string;

    @ApiProperty({
        description: 'desc event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(3, 300)
    desc: string;

    @ApiProperty({description: 'Combo events', type: [String], required: false})
    @IsOptional()
    @IsString({each: true})
    combo_ids: string[];

    @ApiProperty({
        description: 'seat map event',
        type: String,
    })
    @IsString()
    seat_map_id: string;

    @ApiProperty({
        description: 'slug to event',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    slug: string;

    @ApiProperty({
        description: 'Status event',
        type: String,
        enum: Status,
        default: Status.ACTIVE,
        required: false
    })
    @IsOptional()
    status: string;

    @ApiProperty({
        description: 'Flag để hiển thị danh sách ca sỹ thật hay custom text',
        type: Boolean,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    show_artists?: boolean;

    @ApiProperty({
        description: 'Text tùy ý hiển thị thay vì danh sách ca sỹ (chỉ dùng khi show_artists = false)',
        type: String,
        required: false,
        example: 'Nhiều nghệ sỹ nổi tiếng'
    })
    @IsOptional()
    @IsString()
    @Length(0, 200)
    custom_artists_text?: string;

    @ApiProperty({
        description: "Show time data",
        isArray: true,
        type: UpdateShowTimes,
        required: false
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateShowTimes)
    showsTimeData: UpdateShowTimes[];

    @ApiProperty({
        description: "Content event data", 
        isArray: true,
        type: () => UpdateContentEvent,
        required: false
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateContentEvent)
    contentEventData: UpdateContentEvent[];

    @ApiProperty({
        description: "Content event data",
        isArray: true,
        type: () => UpdateSeatSection,
        required: false
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateSeatSection)
    seatSelectionData: UpdateSeatSection[];
}
 