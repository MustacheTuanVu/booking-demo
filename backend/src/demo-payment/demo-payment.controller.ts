import { Body, Get, Post, Query, Res } from '@nestjs/common';
import { Control } from 'src/common/meta/control.meta';
import { Description } from 'src/common/meta/description.meta';
import { Public } from 'src/common/meta/public.meta';
import { User } from 'src/common/meta/user.meta';
import { DemoPaymentService } from './demo-payment.service';
import { CreateDemoPaymentDto } from './dto/create-demo-payment.dto';

@Control('demo-payment')
export class DemoPaymentController {
    constructor(private readonly _demoPaymentService: DemoPaymentService) {}

    @Post('create-payment-link')
    @Description('Tạo link thanh toán demo', [
        { status: 200, description: 'Tạo link thành công' },
    ])
    async createPayment(
        @User() username: string,
        @Body() body: CreateDemoPaymentDto,
    ) {
        return this._demoPaymentService.createPaymentLink(username, body);
    }

    @Public()
    @Post('create-payment-url-public')
    async createPaymentUrlPublic(@Body() body: CreateDemoPaymentDto) {
        return this._demoPaymentService.createPaymentLink(body.phone, body);
    }

    @Public()
    @Get('return')
    async handleReturn(
        @Query('orderId') orderId: string,
        @Query() query: any,
        @Res() res: any,
    ) {
        if (query.code !== '00' || query.status !== 'PAID') {
            return res.redirect(`${process.env.FE_URI}/thanh-toan-that-bai/`);
        }

        try {
            await this._demoPaymentService.markOrderAsPaid(orderId);
            return res.redirect(
                `${process.env.FE_URI}/thanh-toan-thanh-cong/${orderId}`,
            );
        } catch (error) {
            return res.redirect(`${process.env.FE_URI}/thanh-toan-that-bai/`);
        }
    }

    @Public()
    @Get('cancel')
    async handleCancel(@Query('orderId') orderId: string, @Res() res: any) {
        await this._demoPaymentService.markOrderAsCancelled(orderId);
        return res.redirect(`${process.env.FE_URI}/thanh-toan-that-bai/`);
    }

    @Post('create-membership-payment-url')
    async createMembershipPaymentUrl(
        @User() username: string,
        @Body() body: CreateDemoPaymentDto,
    ) {
        return this._demoPaymentService.createMembershipPaymentUrl(
            username,
            body,
        );
    }

    @Public()
    @Get('return-membership')
    async handleReturnMembership(
        @Query('orderId') orderId: string,
        @Query('memberType') memberType: string,
        @Query() query: any,
        @Res() res: any,
    ) {
        if (query.code === '00' && query.status === 'PAID') {
            await this._demoPaymentService.markMembershipAsPaid(
                orderId,
                memberType,
            );
        }
        return res.redirect(`${process.env.FE_URI}/customer/my-type/`);
    }

    @Public()
    @Get('cancel-membership')
    handleCancelMembership(@Res() res: any) {
        return res.redirect(`${process.env.FE_URI}/customer/my-type/`);
    }
}
