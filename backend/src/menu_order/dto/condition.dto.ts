import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from 'src/common/enum/status.enum';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { MenuOrderType } from '../enum/type.enum';

export class GetMenuOrderByCondition extends PaginationDto {
  @ApiProperty({
    description: 'Status',
    type: String,
    required: false,
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsString()
  @IsEnum(Status, { message: 'status must be a valid enum value' })
  @IsOptional()
  status: string;

  @ApiProperty({
    description: 'Type',
    type: String,
    required: false,
    enum: MenuOrderType,
    example: MenuOrderType.COMBO,
  })
  @IsString()
  @IsEnum(MenuOrderType, { message: 'type must be a valid enum value' })
  @IsOptional()
  type: string;
}
