import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Status } from 'src/common/enum/status.enum';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { CustomerType } from 'src/users/enum/type.enum';

export class GetPromotionByCondition extends PaginationDto {
    @ApiProperty({
        description: 'Status',
        type: String,
        required: false,
        enum: Status,
        example: Status.ACTIVE,
    })
    @IsString()
    @IsEnum(Status, { message: 'status must be either ...' })
    @IsOptional()
    status: string;

    @ApiProperty({
        description: 'For',
        type: String,
        required: false,
        enum: CustomerType,
        example: CustomerType.K,
    })
    @IsString()
    @IsEnum(CustomerType, { message: 'CustomerType must be either ...' })
    @IsOptional()
    for: string;

    @ApiProperty({
        description: 'expired: 1 or 0',
        type: String,
        required: false,
        enum: [0, 1],
    })
    @IsString()
    @IsIn(['0', '1'], { message: 'expired chỉ được phép là 0 hoặc 1' })
    @IsOptional()
    expired: String;
}
