import { Roles } from 'src/common/meta/role.meta';
import { BankService } from './bank.service';
import { Control } from 'src/common/meta/control.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Delete, Post, Put, Query } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { User } from 'src/common/meta/user.meta';
import { CreateBankDto } from './dto/create.dto';
import { UpdateBankDto } from './dto/update.dto';

@Control('bank')
export class BankController {
    constructor(private readonly _bankService: BankService) {}

    // @Roles(UserRole.USER)
    @Post('createBank')
    @Description('Tạo bank mới', [{ status: 200, description: 'Create successfully' }])
    async createBank(@User() username, @Body() createDto: CreateBankDto) {
        return await this._bankService.createBank(username, createDto);
    }

    // @Roles(UserRole.USER)
    @Put('updateBank')
    @Description('Update bank ', [{ status: 200, description: 'Update successfully' }])
    async updateBank(@User() username, @Query('id') id: string, @Body() updateBank: UpdateBankDto) {
        return await this._bankService.updateBank(username, id, updateBank);
    }

    @Delete('deleteBank')
    @Roles(UserRole.USER)
    @Description('Delete bank', [
        { status: 200, description: 'Update successfully' },
    ])
    async deleteBank(@User() username, @Query('id') id: string) {
        return await this._bankService.deleteBank(id);
    }
}
