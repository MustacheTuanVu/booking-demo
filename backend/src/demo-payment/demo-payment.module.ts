import { Module } from '@nestjs/common';
import { OrdersModule } from 'src/orders/orders.module';
import { PaymentModule } from 'src/payment/payment.module';
import { DemoPaymentController } from './demo-payment.controller';
import { DemoPaymentService } from './demo-payment.service';

@Module({
    imports: [PaymentModule, OrdersModule],
    controllers: [DemoPaymentController],
    providers: [DemoPaymentService],
    exports: [DemoPaymentService],
})
export class DemoPaymentModule {}
