import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeBuy } from 'src/membership_logs/enum/type.enum';
import { TypeQuery } from '../enum/type.dto';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { UserStatus } from 'src/users/enum/status.enum';

export class getUserByCondition extends PaginationDto{

  @ApiProperty({
    description: 'status',
    required: false,
    type: String,
    enum: UserStatus
  })
  @IsOptional()
  @IsEnum(UserStatus, {message: 'status'})
  status?: string;

  @ApiProperty({
    description: 'Staff or customer',
    required: false,
    type: String,
    enum: TypeQuery
  })
  @IsOptional()
  @IsEnum(TypeQuery, {message: 'Staff or customer'})
  type?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  @IsOptional()
  query?: string = '';
}
