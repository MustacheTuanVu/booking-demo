import {
  Body,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Menu_orderService } from './menu_order.service';
import { Control } from 'src/common/meta/control.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { CreateMenuOrderDto } from './dto/create.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from 'src/common/meta/upload-file.meta';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateMenuOrderDto } from './dto/update.dto';
import { GetMenuOrderByCondition } from './dto/condition.dto';

@Control('menu_order')
export class Menu_orderController {
  constructor(private readonly _menu_orderService: Menu_orderService) {}

  @Get('GetMyMenuOrderByCondition')
  @Description('Lấy thông tin Menu Order', [
    { status: 200, description: 'Create successfully' },
  ])
  async GetMyMenuOrderByCondition(@Query() condition: GetMenuOrderByCondition) {
    return await this._menu_orderService.getMenuOrderByCondition(condition);
  }

  @Post('Create')
  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Description('Tạo một item mới', [
    { status: 200, description: 'Create successfully' },
  ])
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  async createMenuOrder(
    @Body() createItem: CreateMenuOrderDto,
    @UploadedFile() file,
  ) {
    return await this._menu_orderService.createMenuOrder(createItem, file);
  }

  @Put('Update')
  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Description('Update Item', [
    { status: 200, description: 'Update successfully' },
  ])
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  async updateMenuOrder(
    @Query('id') id: string,
    @Body() updateItem: UpdateMenuOrderDto,
    @UploadedFile() file,
  ) {
    return await this._menu_orderService.updateMenuOrder(id, updateItem, file);
  }

  @Delete('Delete')
  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Description('Delete Item', [
    { status: 200, description: 'Delete successfully' },
  ])
  async deleteMenuOrder(@Query('id') id: string) {
    return await this._menu_orderService.deleteMenuOrder(id);
  }
}
