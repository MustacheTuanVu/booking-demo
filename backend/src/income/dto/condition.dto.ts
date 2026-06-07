import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/paging/paging.dto";
import { UserStatus } from "src/users/enum/status.enum";

export class IncomeCondition extends PaginationDto{

}