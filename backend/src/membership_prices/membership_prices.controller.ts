import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Membership_pricesService } from './membership_prices.service';
import { Control } from 'src/common/meta/control.meta';
import { CreatecPriceMembership } from './dto/create.dto';
import { UpdatePriceMembership } from './dto/update.dto';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { Description } from 'src/common/meta/description.meta';

@Control('membership_prices')
export class Membership_pricesController {
  constructor(
    private readonly _membership_pricesService: Membership_pricesService,
  ) {}

  @Get()
  @Description('Get', [{ status: 200, description: 'Get successfully' }])
  async get() {
    return await this._membership_pricesService.get();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Description('Tạo mới', [{ status: 200, description: 'Create successfully' }])
  async create(@Body() data: CreatecPriceMembership) {
    return await this._membership_pricesService.create(data);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Description('Cập nhật', [{ status: 200, description: 'Update successfully' }])
  async update(@Param('id') id: string, @Body() data: UpdatePriceMembership) {
    return await this._membership_pricesService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Description('Xóa', [{ status: 200, description: 'Delete successfully' }])
  async delete(@Param('id') id: string) {
    return await this._membership_pricesService.delete(id);
  }
}
