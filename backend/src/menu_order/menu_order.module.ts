import {Menu_orderRepo } from './menu_order.repo';import { Menu_order, Menu_orderSchema } from './schema/menu_order.schema';import { Menu_orderService } from './menu_order.service';import { Menu_orderController } from './menu_order.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Menu_itemModule } from 'src/menu_item/menu_item.module';
import { MediaModule } from 'src/media/media.module';

@Module({
    imports: [UsersModule, 
        MongooseModule.forFeature([{name: Menu_order.name, schema: Menu_orderSchema}]),
        Menu_itemModule,
        MediaModule
    ],
    controllers: [Menu_orderController],
    providers: [Menu_orderService, Menu_orderRepo],
    exports: [Menu_orderService, Menu_orderRepo]
})
export class Menu_orderModule {}

