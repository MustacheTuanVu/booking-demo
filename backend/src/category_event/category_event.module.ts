import {Category_eventRepo } from './category_event.repo';
import { Category_eventService } from './category_event.service';import { Category_eventController } from './category_event.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Category_event, Category_eventSchema } from './schema/category.schema';

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Category_event.name, schema: Category_eventSchema}])],
    controllers: [ Category_eventController],
    providers: [ Category_eventService, Category_eventRepo],
    exports: [ Category_eventService, Category_eventRepo]
})
export class Category_eventModule {}

