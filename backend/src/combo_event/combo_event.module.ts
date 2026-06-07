import {Combo_eventRepo } from './combo_event.repo';import { Combo_event, Combo_eventSchema } from './schema/combo_event.schema';import { Combo_eventService } from './combo_event.service';import { Combo_eventController } from './combo_event.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Menu_orderModule } from 'src/menu_order/menu_order.module';

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Combo_event.name, schema: Combo_eventSchema}]), Menu_orderModule],
    controllers: [Combo_eventController],
    providers: [Combo_eventService, Combo_eventRepo],
    exports: [Combo_eventService, Combo_eventRepo]
})
export class Combo_eventModule {}

