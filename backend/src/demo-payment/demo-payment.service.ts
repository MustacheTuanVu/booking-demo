import { Injectable } from '@nestjs/common';
import { MessageCode } from 'src/common/exception/MessageCode';
import { OrderStatus } from 'src/orders/enum/status.enum';
import { OrdersService } from 'src/orders/orders.service';
import { CreatePayment } from 'src/payment/dto/create.dto';
import { PaymentMethod } from 'src/payment/enum/method.enum';
import { PaymentService } from 'src/payment/payment.service';
import { CreateDemoPaymentDto } from './dto/create-demo-payment.dto';

@Injectable()
export class DemoPaymentService {
    constructor(
        private readonly _paymentService: PaymentService,
        private readonly _orderService: OrdersService,
    ) {}

    async createPaymentLink(username: string, data: CreateDemoPaymentDto) {
        const paymentLinkId = `demo-${data.orderCode}`;
        const payment: CreatePayment = {
            order_id: data.description,
            payment_method: PaymentMethod.BANK_TRANSFER,
            code: paymentLinkId,
            status: OrderStatus.PENDING,
            note: data.description,
            amount: data.amount,
        };

        await this._paymentService.createPaymentOrder(
            username || data.phone,
            payment,
        );

        if (data.amount <= 0) {
            await this.markOrderAsPaid(data.description);
            return null;
        }

        return {
            checkoutUrl: this.withSuccessStatus(data.returnUrl),
            paymentLinkId,
            orderCode: data.orderCode,
            amount: data.amount,
            status: OrderStatus.PENDING,
        };
    }

    async markOrderAsPaid(orderId: string) {
        try {
            return await Promise.all([
                this._paymentService.markPaymentAsPaid(orderId),
                this._orderService.orderPayment(orderId, OrderStatus.PAID),
            ]);
        } catch (error) {
            await this._paymentService.updatePaymentStatus(
                orderId,
                OrderStatus.PENDING,
            );
            throw MessageCode.REQUEST.BAD_REQUEST;
        }
    }

    async markOrderAsCancelled(orderId: string) {
        return this._paymentService.updatePaymentStatus(
            orderId,
            OrderStatus.PENDING,
        );
    }

    async createMembershipPaymentUrl(
        username: string,
        data: CreateDemoPaymentDto,
    ) {
        const amount = await this._paymentService.calculatePriceForMembership(
            username,
            data.memberType,
            data.amount,
        );

        return {
            checkoutUrl: this.withSuccessStatus(data.returnUrl),
            paymentLinkId: `demo-membership-${data.orderCode}`,
            orderCode: data.orderCode,
            amount,
            status: OrderStatus.PENDING,
        };
    }

    async markMembershipAsPaid(uid: string, memberType: string) {
        try {
            return await this._paymentService.markMemberShipAsPaid(
                uid,
                memberType,
            );
        } catch (error) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }
    }

    private withSuccessStatus(url: string) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}code=00&status=PAID&mode=demo`;
    }
}
