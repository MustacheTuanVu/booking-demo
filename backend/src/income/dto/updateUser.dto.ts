import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { UserRole } from 'src/users/enum/role.enum';

export class UpdateUserIncome {
  @ApiProperty({
    description: 'Role',
    type: String,
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'ohh UserRole' })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'Time from (start date)',
    required: false,
    example: '2024-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  time_create?: Date;
}
