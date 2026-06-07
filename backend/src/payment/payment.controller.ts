import { Controller, Get, Post, Put, Delete, Query, Body, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { Control } from 'src/common/meta/control.meta';
import { Public } from 'src/common/meta/public.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { CreateURLDto } from './dto/create_url.dto';
import { PaymentService } from './payment.service';
import { User } from 'src/common/meta/user.meta';
import { CreatePayment } from './dto/create.dto';
import { UpdatePayment } from './dto/update.dto';

@Control('payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly _paymentService: PaymentService) { }

    @Post('create_payment_url')
    @Roles(UserRole.USER, UserRole.BOSS, UserRole.ADMIN)
    @Description('Tạo URL thanh toán VNPay', [{ status: 200, description: 'Tạo URL thành công' }])
    async createPaymentUrl(@Req() req: any, @Body() body: CreateURLDto, @Res() res: Response): Promise<any> {
        const url = await this._paymentService.createPaymentUrl(body, req.user);
        return res.json({ url });
    }

    @Post('create_payment_url_public')
    @Public()
    @Description('Tạo URL thanh toán VNPay', [{ status: 200, description: 'Tạo URL thành công' }])
    async createPaymentUrlPublic(@Req() req: any, @Body() body: any, @Res() res: Response): Promise<any> {
        const url = await this._paymentService.createPaymentUrl(body, req?.user);
        return res.json({ url });
    }

    @Get('vnpay_return')
    @Public()
    @Description('Xử lý kết quả trả về từ VNPay, không thể call từ booking online', [{ status: 200, description: 'Xử lý thành công' }])
    async vnpayReturn(@Query() query: any, @Res() res: any) {
        const result = await this._paymentService.handleReturn(query);

        if (result && result.code && result.code == '00') {
            return res.redirect(process.env.FE_URI + '/thanh-toan-thanh-cong/' + result.orderCode);
        } else {
            return res.redirect(process.env.FE_URI + '/thanh-toan-that-bai/');
        }
    }

    @Get('vnpay_ipn')
    @Public()
    @Description('Xử lý IPN từ VNPay, không thể call từ booking online', [{ status: 200, description: 'Xử lý IPN thành công' }])
    async vnpayIPN(@Query() query: any) {
        const result = await this._paymentService.handleIPN(query);
        return result;
    }


    @Post('create_membership_payment_url')
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BOSS)
    @Description('Tạo URL thanh toán mua hạng thẻ', [{ status: 200, description: 'Tạo URL thành công' }])
    async createMembershipPaymentUrl(
        @Req() req: any,
        @Body() body: any,
        @Res() res: Response
    ): Promise<any> {
        const url = await this._paymentService.createMembershipPaymentUrl(body, req.user);
        return res.json({ url });
    }

    // API mới xử lý trả về của giao dịch mua hạng thẻ
    @Get('vnpay_return_membership')
    @Public()
    @Description('Xử lý kết quả trả về từ VNPay cho giao dịch mua hạng thẻ', [{ status: 200, description: 'Xử lý thành công' }])
    async vnpayReturnMembership(@Query() query: any, @Res() res: Response): Promise<any> {
        console.log('debug here 0')
        const result = await this._paymentService.handleReturnMembership(query);

        console.log('debug here')

        if (result && result.code && result.code == '00') {
            return res.redirect(process.env.FE_URI + '/customer/my-type/');
        } else {
            return res.redirect(process.env.FE_URI + '/customer/my-type/');
        }
    }

    @Public()
    @Post('CreateFor')
    @Description('Tạo payment cho order', [{ status: 200, description: 'Create successfully' }])
    async createPaymentOrder(@User() username, @Body() createPayment: CreatePayment) {
        return await this._paymentService.createPaymentOrder(username, createPayment);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Put('UpdateFor')
    @Description('update payment cho order', [{ status: 200, description: 'Update successfully' }])
    async updatePaymentOrder(@User() username, @Query('idOrder') idOrder: string, @Body() updatePayment: UpdatePayment) {
        return await this._paymentService.updatePayment(idOrder, updatePayment, username);
    }


}
