import { Controller, Get, Post, Put, Delete, Query, Body, Res, Req } from '@nestjs/common';
import { VNPayTransactionService } from './vnp_transaction.service';
import { Response } from 'express';
import { Control } from 'src/common/meta/control.meta';
import { Public } from 'src/common/meta/public.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { CreateURLDto } from './dto/create_url.dto';

@Control('vnp_transaction')
@Controller('vnp_transaction')
export class VNPayTransactionController {
  constructor(private readonly _vnpTransactionService: VNPayTransactionService) {}

  @Post('create_payment_url')
  @Roles(UserRole.USER)
  @Description('Tạo URL thanh toán VNPay', [{ status: 200, description: 'Tạo URL thành công' }])
  async createPaymentUrl(@Req() req: any, @Body() body: CreateURLDto, @Res() res: Response): Promise<any> {
    const url = await this._vnpTransactionService.createPaymentUrl(body, req.user);
    return res.json({url});
  }


  @Get('vnpay_return')
  @Public()
  @Description('Xử lý kết quả trả về từ VNPay, không thể call từ booking online', [{ status: 200, description: 'Xử lý thành công' }])
  async vnpayReturn(@Query() query: any, @Res() res: any) {
    const result = await this._vnpTransactionService.handleReturn(query);

    if (result && result.code && result.code == '00') {
      return res.redirect(process.env.FE_URI + '/thanh-toan-thanh-cong/');
    } else {
      return res.redirect(process.env.FE_URI + '/thanh-toan-that-bai/');
    }
    
    
  }

  @Get('vnpay_ipn')
  @Public()
  @Description('Xử lý IPN từ VNPay, không thể call từ booking online', [{ status: 200, description: 'Xử lý IPN thành công' }])
  async vnpayIPN(@Query() query: any) {
    const result = await this._vnpTransactionService.handleIPN(query);
    return result;
  }

  // @Post('querydr')
  // @Public()
  // @Description('Truy vấn giao dịch VNPay', [{ status: 200, description: 'Truy vấn thành công' }])
  // async queryDR(@Body() body: any) {
  //   return await this._vnpTransactionService.queryDR(body);
  // }

  // @Post('refund')
  // @Roles(UserRole.ADMIN)
  // @Description('Xử lý hoàn tiền giao dịch VNPay', [{ status: 200, description: 'Hoàn tiền thành công' }])
  // async refund(@Body() body: any) {
  //   return await this._vnpTransactionService.refund(body);
  // }

  // @Post('create')
  // @Roles(UserRole.ADMIN)
  // @Description('Tạo giao dịch VNPay mới', [{ status: 200, description: 'Tạo thành công' }])
  // async createTransaction(@Body() createTransactionDto: any) {
  //   return await this._vnpTransactionService.createTransaction(createTransactionDto);
  // }

  // @Put('update')
  // @Roles(UserRole.ADMIN)
  // @Description('Cập nhật giao dịch VNPay theo txnRef', [{ status: 200, description: 'Cập nhật thành công' }])
  // async updateTransaction(@Query('txnRef') txnRef: string, @Body() updateData: any) {
  //   return await this._vnpTransactionService.updateTransaction(txnRef, updateData);
  // }

  // @Get('getByCondition')
  // @Public()
  // @Description('Lấy giao dịch VNPay theo điều kiện', [{ status: 200, description: 'Lấy dữ liệu thành công' }])
  // async getTransactionByCondition(@Query() query: any) {
  //   return await this._vnpTransactionService.getTransactionByCondition(query);
  // }

  // @Delete('delete')
  // @Roles(UserRole.ADMIN)
  // @Description('Xóa giao dịch VNPay theo txnRef', [{ status: 200, description: 'Xóa thành công' }])
  // async deleteTransaction(@Query('txnRef') txnRef: string) {
  //   return await this._vnpTransactionService.deleteTransaction(txnRef);
  // }
}
