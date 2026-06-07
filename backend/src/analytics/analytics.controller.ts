// src/analytics/analytics.controller.ts
import { Get, Query, Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { Description } from 'src/common/meta/description.meta';
import { GetRevenueReportDto } from './dto/getRevenueReport.dto';
import { GetAnalytics } from './dto/getByCondition.dto';
import { Control } from 'src/common/meta/control.meta';
import { getUserByCondition } from './dto/getUserByCondition.dto';

@Control('analytics')
export class AnalyticsController {
  constructor(private readonly _analyticsService: AnalyticsService) {}

  @Get('GetRevenueReport')
  // @Roles( UserRole.BOSS)
  @Description('Báo cáo doanh thu theo khoảng thời gian (tổng doanh thu, doanh thu từ order và membership)', [
    { status: 200, description: 'Thành công' },
  ])
  async getRevenueReport(@Query() query: GetRevenueReportDto) {
    return await this._analyticsService.getDetailedRevenueReport(query);
  }

  // doanh thu theo nhân viên, khach hàng
  @Get('GetRevenueReportForStaffOrCustomer')
  // @Roles(UserRole.BOSS)
  @Description('Báo cáo doanh thu theo khoảng thời gian của nhân viên hoặc khách hàng', [
    { status: 200, description: 'Thành công' },
  ])
  async GetRevenueReportForStaffOrCustomer(@Query() query: getUserByCondition) {
    return await this._analyticsService.getRevenueReportForStaffOrCustomer(query);
  }

  // doanh thu theo từng sự kiện 


  // xêp hạng combo


  //


}
