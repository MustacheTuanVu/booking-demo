import { Roles } from 'src/common/meta/role.meta';
import { IncomeService } from './income.service';
import { Control } from 'src/common/meta/control.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateIcomeDto } from './dto/createIncom.dto';
import { UpdateIncomeDto } from './dto/updateIncome.dto';
import { IncomeCondition } from './dto/condition.dto';
import { UpdateUserIncome } from './dto/updateUser.dto';

@Control('income')
export class IncomeController {
  constructor(private readonly _incomeService: IncomeService) {}

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('createIncome')
  @Description('Tạo icome mới', [
    { status: 200, description: 'Create successfully' },
  ])
  async createIncome(@Body() createIncomeDto: CreateIcomeDto, ) {
    return await this._incomeService.createIncome(createIncomeDto);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('updateIncome')
  @Description('Update income ', [
    { status: 200, description: 'Update successfully' },
  ])
  async updateStatusIncome(
    @Query('id') id: string,
    @Body() updateIncome: UpdateIncomeDto,
  ) {
    return await this._incomeService.updateStatusIncome(id, updateIncome);
  }

  @Roles(UserRole.BOSS, UserRole.ADMIN, UserRole.USER)
  @Get('getIncomesByCondition')
  @Description('Lấy income theo điểu kiện ', [
    { status: 200, description: 'Get successfully' },
  ])
  async getIncomeByCondition(
    @Query() condition: IncomeCondition,
  ) {
    return await this._incomeService.getIncomeByCondition(condition);
  }

  @Get('getIncomesById')
  @Description('Lấy income theo điểu kiện ', [
    { status: 200, description: 'Get successfully' },
  ])
  async getIncomesById(
    @Query('id') id: string,
  ) {
    return await this._incomeService.getIncomesById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('updateIncomeForUser/:id')
  @Description('Update income nếu có mảng id của user thì sẽ thêm theo id và bỏ qua query', [
    { status: 200, description: 'Update successfully' },
  ])
  async updateIncomeForUser(
    @Param('id') incomeId: string,
    @Body() userIncome: string[],
    @Query() query: UpdateUserIncome
  ) {
    return await this._incomeService.updateIncomeForUser(incomeId, query, userIncome);
  }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Delete('deleteIncome')
    @Description('Update income nếu có mảng id của user thì sẽ thêm theo id và bỏ qua query', [
      { status: 200, description: 'Update successfully' },
    ])
    async deleteIncome(
      @Body() userIncome: string[],
      @Query() query: UpdateUserIncome
    ) {
      return await this._incomeService.deleteIncome(query, userIncome);
    }
}
