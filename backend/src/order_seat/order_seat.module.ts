import { Order_seatRepo } from './order_seat.repo';
import { Order_seat, Order_seatSchema } from './schema/order_seat.schema';
import { Order_seatService } from './order_seat.service';
import { Order_seatController } from './order_seat.controller';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Seat_sectionModule } from 'src/seat_section/seat_section.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
    imports: [
        UsersModule,
        MongooseModule.forFeature([{ name: Order_seat.name, schema: Order_seatSchema }]),
        Seat_sectionModule,
    ],
    controllers: [Order_seatController],
    providers: [Order_seatService, Order_seatRepo],
    exports: [Order_seatService, Order_seatRepo],
})
export class Order_seatModule {}
