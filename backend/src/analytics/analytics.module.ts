import { AnalyticsService } from './analytics.service';import { AnalyticsController } from './analytics.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Membership_logsModule } from 'src/membership_logs/membership_logs.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
    imports: [UsersModule, Membership_logsModule, OrdersModule],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService]
})
export class AnalyticsModule {}

