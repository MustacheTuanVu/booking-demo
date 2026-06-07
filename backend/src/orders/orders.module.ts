import {OrdersRepo } from './orders.repo';import { Orders, OrdersSchema } from './schema/orders.schema';import { OrdersService } from './orders.service';import { OrdersController } from './orders.controller';
import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { RuntimeStateModule } from 'src/runtime-state/runtime-state.module';
import { Order_detailModule } from 'src/order_detail/order_detail.module';
import { Order_seatModule } from 'src/order_seat/order_seat.module';
import { PromotionModule } from 'src/promotion/promotion.module';
import { EventsModule } from 'src/events/events.module';
import { ShowtimesModule } from 'src/showtimes/showtimes.module';
import { PaymentModule } from 'src/payment/payment.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { Combo_eventModule } from 'src/combo_event/combo_event.module';
import { Menu_itemService } from 'src/menu_item/menu_item.service';
import { Menu_itemModule } from 'src/menu_item/menu_item.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { Membership_logsModule } from 'src/membership_logs/membership_logs.module';
import { SystemModule } from 'src/system/system.module';

@Module({
    imports: [UsersModule, 
        Order_detailModule,
        Order_seatModule,
        MongooseModule.forFeature([{name: Orders.name, schema: OrdersSchema}]), 
        PromotionModule,
        forwardRef(() =>EventsModule),
        forwardRef(() =>PaymentModule),
        RuntimeStateModule,
        forwardRef(() =>GatewayModule),
        Combo_eventModule,
        Menu_itemModule,
        MailerModule,
        Membership_logsModule,
        SystemModule
    ],
    controllers: [ OrdersController],
    providers: [ OrdersService, OrdersRepo],
    exports: [ OrdersService, OrdersRepo]
})
export class OrdersModule {}

 
