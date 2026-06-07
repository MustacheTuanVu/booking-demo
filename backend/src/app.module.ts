import { DemoOtpModule } from './demo-otp/demo-otp.module';
import { DemoPaymentModule } from './demo-payment/demo-payment.module';
import { IncomeModule } from './income/income.module';
import { BankModule } from './bank/bank.module';
import { TicketModule } from './ticket/ticket.module';
import { Combo_eventModule } from './combo_event/combo_event.module';
import { Menu_orderModule } from './menu_order/menu_order.module';
import { Membership_pricesModule } from './membership_prices/membership_prices.module';
import { Membership_logsModule } from './membership_logs/membership_logs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentModule } from './payment/payment.module';
import { RuntimeStateModule } from './runtime-state/runtime-state.module';
import { MediaModule } from './media/media.module';
import { Category_itemModule } from './category_item/category_item.module';
import { Menu_itemModule } from './menu_item/menu_item.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GatewayModule } from './gateway/gateway.module';
import { SystemModule } from './system/system.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EventsModule } from './events/events.module';
import { PromotionModule } from './promotion/promotion.module';
import { ArtistsModule } from './artists/artists.module';
import { Order_seatModule } from './order_seat/order_seat.module';
import { Order_detailModule } from './order_detail/order_detail.module';
import { Content_eventModule } from './content_event/content_event.module';
import { Seat_sectionModule } from './seat_section/seat_section.module';
import { OrdersModule } from './orders/orders.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { Seat_mapModule } from './seat_map/seat_map.module';
import { Category_eventModule } from './category_event/category_event.module';
import { Module } from '@nestjs/common';
import { VNPayTransactionsModule } from './vnpay/vnp_transactions.module';
import { MailerModule } from './mailer/mailer.module';
import { UsersService } from './users/users.service';
import { ToolExcelModule } from './excel/tool-excel.module';

const ENV = process.env.NODE_ENV;

@Module({
    imports: [
        DemoOtpModule,
        DemoPaymentModule,
        IncomeModule,
        BankModule,
        TicketModule,
        Combo_eventModule,
        Menu_orderModule,
        ToolExcelModule,
        Membership_pricesModule,
        Membership_logsModule,
        AnalyticsModule,
        MailerModule,
        PaymentModule,
        RuntimeStateModule,
        MediaModule,
        ConfigModule.forRoot({ envFilePath: !ENV ? '.env' : `.env.${ENV}` }),
        MongooseModule.forRoot(process.env.MONGOURL, {
            dbName: process.env.DATABASE,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot: '/public',
        }),
        AuthModule,
        UsersModule,
        GatewayModule,
        SystemModule,
        ScheduleModule,
        EventsModule,
        PromotionModule,
        ArtistsModule,
        Order_seatModule,
        Order_detailModule,
        Content_eventModule,
        Seat_sectionModule,
        OrdersModule,
        ShowtimesModule,
        Seat_mapModule,
        Category_eventModule,
        Category_itemModule,
        Menu_itemModule,
        VNPayTransactionsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor(private readonly _userService: UsersService) {
        this._userService.startScheduleLogger();
    }
}
