import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { Control } from "src/common/meta/control.meta";
import { Description } from 'src/common/meta/description.meta';
import { CreatePromotion } from './dto/create.dto';
import { GetPromotionByCondition } from './dto/condition.dto';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { User } from 'src/common/meta/user.meta';
import { UpdatePromotion } from './dto/update.dto';
import { BuyPromotion } from './dto/buy.dto';
import { GetPromotionByAdmin } from './dto/condition.admin.dto';

@Control('promotion')
export class PromotionController {
    constructor(private readonly _promotionService: PromotionService,) { }

    @Get('GetMany')
    @Roles(UserRole.BOSS, UserRole.USER, UserRole.ADMIN)
    @Description('Lấy thông tin Promotion by condition', [{ status: 200, description: 'Create successfully' }])
    async getPromotionByCondition(@Query() condition: GetPromotionByCondition) {
        return await this._promotionService.getPromotionByCondition(condition);
    }

    @Get('GetManyForAdmin')
    // @Roles(UserRole.BOSS, UserRole.ADMIN)
    @Description('Lấy thông tin Promotion by condition', [{ status: 200, description: 'Create successfully' }])
    async getPromotionByConditionByAdmin(@Query() condition: GetPromotionByAdmin) {
        console.log(condition.haveUser)
        return await this._promotionService.getPromotionByAdmin(condition);
    }

    @Get('GetMyPromotion')
    @Roles(UserRole.USER)
    @Description('Lấy thông tin Promotion của tôi', [{ status: 200, description: 'Create successfully' }])
    async GetMyPromotion(@User() username, @Query() condition: GetPromotionByCondition) {
        return await this._promotionService.getMyPromotions(username, condition);
    }

    @Get('GetById/:id')
    @Description('Lấy thông tin theo id', [{ status: 200, description: 'Create successfully' }])
    async getPromotionById(@Param('id') id: string) {
        return await this._promotionService.getPromotionById(id);
    }

    @Get('GetByCode/:code')
    @Description('Lấy thông tin theo code', [{ status: 200, description: 'Create successfully' }])
    async getPromotionByCode(@Param('code') code: string) {
        return await this._promotionService.getPromotionByCode(code);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('Create')
    @Description('Tạo một promotion mới', [{ status: 200, description: 'Create successfully' }])
    async createPromotion(@Body() createPromo: CreatePromotion) {
        return await this._promotionService.createPromotion(createPromo);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Put('Update')
    @Description('Cập nhật promotion', [{ status: 200, description: 'Create successfully' }])
    async updatePromotion(@Query('id') id: string, @Body() updatePromo: UpdatePromotion) {
        return await this._promotionService.updatePromotion(id, updatePromo);
    }

    @Roles(UserRole.USER)
    @Put('buyPromotion')
    @Description('Mua promotion', [{ status: 200, description: 'Create successfully' }])
    async buyPromotion(@User() username, @Body() buy: BuyPromotion) {
        return await this._promotionService.buyPromotion(username, buy.promotionId);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Delete('Delete')
    @Description('Delete promotion', [{ status: 200, description: 'Delete successfully' }])
    async deletePromotion(@Query('id') id: string) {
        return await this._promotionService.deletePromotion(id);
    }
}

