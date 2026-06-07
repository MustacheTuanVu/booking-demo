jest.mock('sharp', () => jest.fn());

import { OrderStatus } from 'src/orders/enum/status.enum';
import { DemoPaymentService } from './demo-payment.service';

describe('DemoPaymentService', () => {
    const paymentService = {
        createPaymentOrder: jest.fn(),
        markPaymentAsPaid: jest.fn(),
        updatePaymentStatus: jest.fn(),
        calculatePriceForMembership: jest.fn(),
        markMemberShipAsPaid: jest.fn(),
    };
    const ordersService = {
        orderPayment: jest.fn(),
    };
    let service: DemoPaymentService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new DemoPaymentService(
            paymentService as any,
            ordersService as any,
        );
    });

    it('creates a local payment and returns a local success callback', async () => {
        paymentService.createPaymentOrder.mockResolvedValue({});

        const result = await service.createPaymentLink('0900000000', {
            orderCode: 1234567,
            amount: 250000,
            description: '665f1f77bcf86cd799439011',
            returnUrl:
                'http://localhost:9000/demo-payment/return?orderId=665f1f77bcf86cd799439011',
            cancelUrl:
                'http://localhost:9000/demo-payment/cancel?orderId=665f1f77bcf86cd799439011',
        });

        expect(paymentService.createPaymentOrder).toHaveBeenCalledWith(
            '0900000000',
            expect.objectContaining({
                order_id: '665f1f77bcf86cd799439011',
                status: OrderStatus.PENDING,
                amount: 250000,
            }),
        );
        expect(result).toEqual(
            expect.objectContaining({
                paymentLinkId: 'demo-1234567',
                status: OrderStatus.PENDING,
                checkoutUrl:
                    'http://localhost:9000/demo-payment/return?orderId=665f1f77bcf86cd799439011&code=00&status=PAID&mode=demo',
            }),
        );
    });

    it('marks both payment and order as paid', async () => {
        paymentService.markPaymentAsPaid.mockResolvedValue({});
        ordersService.orderPayment.mockResolvedValue({});

        await service.markOrderAsPaid('665f1f77bcf86cd799439011');

        expect(paymentService.markPaymentAsPaid).toHaveBeenCalledWith(
            '665f1f77bcf86cd799439011',
        );
        expect(ordersService.orderPayment).toHaveBeenCalledWith(
            '665f1f77bcf86cd799439011',
            OrderStatus.PAID,
        );
    });

    it('uses the calculated membership price in the demo response', async () => {
        paymentService.calculatePriceForMembership.mockResolvedValue(180000);

        const result = await service.createMembershipPaymentUrl(
            '0900000000',
            {
                orderCode: 7654321,
                amount: 200000,
                description: 'Thanh toán membership',
                returnUrl:
                    'http://localhost:9000/demo-payment/return-membership?orderId=user-id&memberType=VIP',
                cancelUrl:
                    'http://localhost:9000/demo-payment/cancel-membership?orderId=user-id&memberType=VIP',
                memberType: 'VIP',
            },
        );

        expect(paymentService.calculatePriceForMembership).toHaveBeenCalledWith(
            '0900000000',
            'VIP',
            200000,
        );
        expect(result.amount).toBe(180000);
        expect(result.checkoutUrl).toContain('code=00&status=PAID&mode=demo');
    });
});
