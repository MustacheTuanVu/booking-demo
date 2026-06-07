import {ShowtimesRepo } from './showtimes.repo';import { Showtimes, ShowtimesSchema } from './schema/showtimes.schema';import { ShowtimesService } from './showtimes.service';import { ShowtimesController } from './showtimes.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Showtimes.name, schema: ShowtimesSchema}])],
    controllers: [ ShowtimesController],
    providers: [ ShowtimesService, ShowtimesRepo],
    exports: [ ShowtimesService, ShowtimesRepo]
})
export class ShowtimesModule {}

