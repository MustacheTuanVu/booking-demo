import {Seat_mapRepo } from './seat_map.repo';import { Seat_map, Seat_mapSchema } from './schema/seat_map.schema';import { Seat_mapService } from './seat_map.service';import { Seat_mapController } from './seat_map.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Seat_map.name, schema: Seat_mapSchema}])],
    controllers: [ Seat_mapController],
    providers: [ Seat_mapService, Seat_mapRepo],
    exports: [ Seat_mapService, Seat_mapRepo]
})
export class Seat_mapModule {}

