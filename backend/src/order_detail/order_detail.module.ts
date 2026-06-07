import {Order_detailRepo } from './order_detail.repo';import { Order_detail, Order_detailSchema } from './schema/order_detail.schema';import { Order_detailService } from './order_detail.service';import { Order_detailController } from './order_detail.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Combo_eventModule } from 'src/combo_event/combo_event.module';
import { Seat_sectionModule } from 'src/seat_section/seat_section.module';

@Module({
    imports: [
        UsersModule, 
        MongooseModule.forFeature([{name: Order_detail.name, schema: Order_detailSchema}]), 
        Combo_eventModule,
        Seat_sectionModule],
    controllers: [ Order_detailController],
    providers: [ Order_detailService, Order_detailRepo],
    exports: [ Order_detailService, Order_detailRepo]
})
export class Order_detailModule {}

