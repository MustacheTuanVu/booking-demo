import {Seat_sectionRepo } from './seat_section.repo';import { Seat_section, Seat_sectionSchema } from './schema/seat_section.schema';import { Seat_sectionService } from './seat_section.service';import { Seat_sectionController } from './seat_section.controller';
import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersModule } from 'src/orders/orders.module';

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Seat_section.name, schema: Seat_sectionSchema}]),
                forwardRef(() =>OrdersModule)],
    controllers: [ Seat_sectionController],
    providers: [ Seat_sectionService, Seat_sectionRepo],
    exports: [ Seat_sectionService, Seat_sectionRepo]
})
export class Seat_sectionModule {}

