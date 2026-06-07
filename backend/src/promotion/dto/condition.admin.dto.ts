

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Status } from "src/common/enum/status.enum";
import { PaginationDto } from "src/common/paging/paging.dto";
import { CustomerType } from "src/users/enum/type.enum";
import { GetPromotionByCondition } from "./condition.dto";


export class GetPromotionByAdmin extends GetPromotionByCondition {
    @ApiProperty({
      description: 'exists user: 1 or 0',
      type: String,
      required: false,
      enum: [0, 1],
    })
    @IsString()
    @IsIn(['0', '1'], { message: 'haveUser chỉ được phép là 0 hoặc 1' })
    @IsOptional()
    haveUser: String;
  
    @ApiProperty({
      description: 'exists: 1 or 0',
      type: String,
      required: false,
      enum: [0, 1],
    })
    @IsString()
    @IsIn(['0', '1'], { message: 'exits chỉ được phép là 0 hoặc 1' })
    @IsOptional()
    exits: String;
  }