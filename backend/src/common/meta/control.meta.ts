import { applyDecorators, Controller, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

export function Control(str:string){
    return applyDecorators(
        Controller(str),
        ApiTags(str.toUpperCase()),
        ApiResponse({status:401, description:'Không có quyền truy cập'})
    )
}