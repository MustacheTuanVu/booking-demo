import { OrdersModule } from 'src/orders/orders.module';
import { PaymentRepo } from './payment.repo';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from 'src/mailer/mailer.module';
import { Seat_sectionModule } from 'src/seat_section/seat_section.module';
import { Order_seatModule } from 'src/order_seat/order_seat.module';

import { Membership_logsModule } from 'src/membership_logs/membership_logs.module';
import { Membership_pricesModule } from 'src/membership_prices/membership_prices.module';

@Module({
    imports: [
        UsersModule,
        Membership_pricesModule,
        Membership_logsModule,
        Seat_sectionModule,
        Order_seatModule,
        MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
        forwardRef(() => OrdersModule),
        MailerModule,
    ],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentRepo],
    exports: [PaymentService, PaymentRepo],
})
export class PaymentModule {}
