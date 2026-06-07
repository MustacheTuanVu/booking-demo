import { Body, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { Control } from 'src/common/meta/control.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { User } from 'src/common/meta/user.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { ToolExcelService } from './tool-excel.service';
import { UploadMedia } from 'src/common/meta/upload-media.meta';
import { GetMenuItemByCondition } from 'src/menu_item/dto/condition.dto';
import { GetPromotionByCondition } from 'src/promotion/dto/condition.dto';
import { GetPromotionByAdmin } from 'src/promotion/dto/condition.admin.dto';
import { getUserByCondition } from 'src/analytics/dto/getUserByCondition.dto';
import { TicketCondition } from 'src/ticket/dto/condition.dto';

@Control('tool-excel')
export class ToolExcelController {

    constructor(private readonly _excelService: ToolExcelService){}

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('uploadFileMenuItem')
    @UploadMedia('file', false)
    @Description('import data menu item', [{status: 200, description: 'add successfully'}])
    async updateFileExcel(@UploadedFile() file){
        return await this._excelService.updateFileExcel(file);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('downloadFileMenuItem')
    @Description('Tạo file excel', [{status: 200, description: 'add successfully'}])
    async downloadFileMenuItem(@Query() dataQuery: GetMenuItemByCondition,@Res() res: Response){
        return await this._excelService.downloadFileMenuItem(dataQuery, res);
    }

     @Roles(UserRole.ADMIN, UserRole.BOSS)
     @Post('uploadFileVoucher')
     @UploadMedia('file', false)
     @Description('import data voucher', [{status: 200, description: 'add successfully'}])
     async updateFileVoucher(@UploadedFile() file){
         return await this._excelService.updateFileVoucher(file);
     }
 
     @Roles(UserRole.ADMIN, UserRole.BOSS)
     @Post('downloadFileVoucher')
     @Description('Tạo file excel', [{status: 200, description: 'add successfully'}])
     async downloadFileVoucher(@Query() dataQuery: GetPromotionByAdmin, @Res() res: Response){
         return await this._excelService.downloadFileVoucher(dataQuery, res);
     }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('uploadFileGuestUser')
    @UploadMedia('file', false)
    @Description('import data guest', [{status: 200, description: 'add successfully'}])
    async uploadFileGuestUser(@UploadedFile() file){
        return await this._excelService.uploadFileGuestUser(file);
    }

    // @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('downloadExcelCollaborator')
    @Description('Tạo file excel Collaborator', [{status: 200, description: 'add successfully'}])
    async downloadFileCollaborator(@Query() query: getUserByCondition, @Res() res: Response){
        return await this._excelService.downloadFileCollaborator(query, res);
    }

    @Post('downloadExcelTicket')
    @Description('Tạo file excel Ticket', [{status: 200, description: 'add successfully'}])
    async downloadExcelTicket(@User() username, @Query() query: TicketCondition, @Res() res: Response){
        return await this._excelService.downloadExcelTicket(username, query, res);
    }
}
