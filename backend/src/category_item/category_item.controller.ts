import { Roles } from 'src/common/meta/role.meta';
import { Category_itemService } from './category_item.service';
import { Control } from 'src/common/meta/control.meta';
import { UserRole } from 'src/users/enum/role.enum';
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateCategoryItem } from './dto/create.dto';
import { GetCategoryByCondition } from './dto/condition.dto';
import { UpdateCategoryItem } from './dto/update.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from 'src/common/meta/upload-file.meta';
import { FileInterceptor } from '@nestjs/platform-express';

@Control('category_item')
export class Category_itemController {
  constructor(private readonly _category_itemService: Category_itemService) {}

  @Get('GetMany')
  @Description('Lấy thông tin categories', [
    { status: 200, description: 'Create successfully' },
  ])
  async getCategoryEvent(@Query() condition: GetCategoryByCondition) {
    return await this._category_itemService.getCategoryByCondition(condition);
  }

  @Get('GetById/:id')
  @Description('Lấy thông tin categories', [
    { status: 200, description: 'Create successfully' },
  ])
  async getCategoryById(@Param('id') id: string) {
    return await this._category_itemService.getCategoryById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('Create')
  @Description('Tạo một category mới', [
    { status: 200, description: 'Create successfully' },
  ])
  async createCategoryItem(@Body() createCategory: CreateCategoryItem) {
    return await this._category_itemService.createCategoryItem(createCategory);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('Update')
  @Description('Cập nhật category', [
    { status: 200, description: 'Create successfully' },
  ])
  async updateCategoryItem(
    @Query('id') id: string,
    @Body() updateCategory: UpdateCategoryItem,
  ) {
    return await this._category_itemService.updateCategoryItem(
      id,
      updateCategory,
    );
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Delete('Delete')
  @Description('Xóa category', [
    { status: 200, description: 'Delete successfully' },
  ])
  async deleteCategoryItem(
    @Query('id') id: string
  ) {
    return await this._category_itemService.deleteCategoryItem(
      id
    );
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('UpdateImage')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  @Description('Update image category', [
    { status: 200, description: 'Update successfully' },
  ])
  async updateImageMennuItem(
    @Query('itemId') itemId: string,
    @UploadedFile() file,
  ) {
    return await this._category_itemService.updateImageCategoryItem(
      itemId,
      file,
    );
  }

}
