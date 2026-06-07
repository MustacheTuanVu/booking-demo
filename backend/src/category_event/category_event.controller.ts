import { Roles } from 'src/common/meta/role.meta';
import { Category_eventService } from './category_event.service';
import { Control } from "src/common/meta/control.meta";
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateCategory } from './dto/create.dto';
import { GetCategoryByCondition } from './dto/condition.dto';
import { UpdateCategory } from './dto/update.dto';

@Control('category_event')
export class Category_eventController {
    constructor(private readonly _category_eventService: Category_eventService, ){}

    @Get('GetMany')
    @Description('Lấy thông tin categories', [{status: 200, description: 'Create successfully'}])
    async getCategoryEvent(@Query() condition: GetCategoryByCondition){
        return await this._category_eventService.getCategoryByCondition(condition);
    }

    @Get('GetById/:id')
    @Description('Lấy thông tin categories', [{ status: 200, description: 'Create successfully' }])
    async getCategoryById(@Param('id') id: string) {
        return await this._category_eventService.getCategoryById(id);
    }
    
    
    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('Create')
    @Description('Tạo một category event mới', [{status: 200, description: 'Create successfully'}])
    async createCategoryEvent(@Body() createCategory: CreateCategory){
        return await this._category_eventService.createCategoryEvent(createCategory);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Put('Update')
    @Description('Cập nhật category', [{status: 200, description: 'Create successfully'}])
    async updateCategoryEvent(@Query('cateId') cateId: string, @Body() updateCategory: UpdateCategory){
        return await this._category_eventService.updateCategoryEvent(cateId, updateCategory);
    }

}

