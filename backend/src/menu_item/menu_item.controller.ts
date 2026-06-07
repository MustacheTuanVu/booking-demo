import { Roles } from 'src/common/meta/role.meta';
import { Menu_itemService } from './menu_item.service';
import { Control } from 'src/common/meta/control.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateMenuItem } from './dto/create.dto';
import { GetMenuItemByCondition } from './dto/condition.dto';
import { UpdateMenuItem } from './dto/update.dto';
import { User } from 'src/common/meta/user.meta';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from 'src/common/meta/upload-file.meta';
import { FileInterceptor } from '@nestjs/platform-express';

@Control('menu_item')
export class Menu_itemController {
  constructor(private readonly _menu_itemService: Menu_itemService) {}

  @Get('GetMyMenuItem')
  @Description('Lấy thông tin Menu Item', [
    { status: 200, description: 'Create successfully' },
  ])
  async GetMyMenuItem(@Query() condition: GetMenuItemByCondition) {
    return await this._menu_itemService.getMenuItemByCondition(condition);
  }

  @Get('GetById/:id')
  @Description('Lấy thông tin theo id', [
    { status: 200, description: 'Create successfully' },
  ])
  async getMenuItemById(@Param('id') id: string) {
    return await this._menu_itemService.getMenuItemById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('Create')
  @Description('Tạo một item mới', [
    { status: 200, description: 'Create successfully' },
  ])
  async createMenuItem(@Body() createItem: CreateMenuItem) {
    return await this._menu_itemService.createMenuItem(createItem);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('Update')
  @Description('Update Item', [
    { status: 200, description: 'Create successfully' },
  ])
  async updateMenuItem(
    @Query('id') id: string,
    @Body() updateItem: UpdateMenuItem,
  ) {
    return await this._menu_itemService.updateMenuItem(id, updateItem);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('UpdateImage')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  @Description('Update image Item', [
    { status: 200, description: 'Update successfully' },
  ])
  async updateImageMennuItem(@Query('itemId') itemId: string, @UploadedFile() file) {
    return await this._menu_itemService.updateImageMennuItem(itemId, file);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Delete('Delete')
  @Description('Delete Item', [
    { status: 200, description: 'Create successfully' },
  ])
  async deleteMenuItem(
    @Query('id') id: string
  ) {
    return await this._menu_itemService.deleteMenuItem(id);
  }
}
