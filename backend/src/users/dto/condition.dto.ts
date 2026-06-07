import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/paging/paging.dto";
import { UserStatus } from "src/users/enum/status.enum";
import { UserRole } from "../enum/role.enum";

export class UserCondition extends PaginationDto{

    @ApiProperty({
        description: 'Role',
        type: String,
        enum: UserRole,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserRole, {message: 'ohh UserRole'})
    @IsString()
    role: string;

    @ApiProperty({
        description: 'Trạng thái',
        type: String,
        enum: UserStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserStatus, {message: 'ohh UserStatus'})
    @IsString()
    status: string;
}