// src/analytics/analytics.service.ts
import { Injectable, Query } from '@nestjs/common';
import { GetRevenueReportDto } from './dto/getRevenueReport.dto';
import { OrdersService } from 'src/orders/orders.service';
import { Membership_logsService } from 'src/membership_logs/membership_logs.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly membershipLogsService: Membership_logsService,
    private readonly userService: UsersService
  ) {}

  async getDetailedRevenueReport(getRevenueReportDto: GetRevenueReportDto) {
    const { startDate, endDate } = getRevenueReportDto;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Tính doanh thu từ đơn hàng (chỉ tính các order đã thanh toán nếu cần)
    const orderRevenue = await this.ordersService.getOrderRevenueByPeriod(start, end);
    // Tính doanh thu từ membership
    const membershipRevenue = await this.membershipLogsService.getMembershipRevenueByPeriod(start, end);
    const totalRevenue = orderRevenue + membershipRevenue;

    // Lấy danh sách order với chỉ _id và createdAt
    const orders = await this.ordersService.getOrderListForAnalytics(start, end);
    // Lấy danh sách membership log với chỉ _id và createdAt
    const membershipLogs = await this.membershipLogsService.getMembershipLogListForAnalytics(start, end);

    return {
      totalRevenue,
      orderRevenue,
      membershipRevenue,
      orders,
      membershipLogs,
    };
  }

  async getRevenueReportForStaffOrCustomer(query){
    const data = await this.userService.getRevenueReportForStaffOrCustomer(query)
    return data
  }
}
