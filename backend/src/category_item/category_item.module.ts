import {Category_itemRepo } from './category_item.repo';import { Category_item, Category_itemSchema } from './schema/category_item.schema';import { Category_itemService } from './category_item.service';import { Category_itemController } from './category_item.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { MediaModule } from 'src/media/media.module';

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Category_item.name, schema: Category_itemSchema}]), MediaModule],
    controllers: [Category_itemController],
    providers: [Category_itemService, Category_itemRepo],
    exports: [Category_itemService, Category_itemRepo]
})
export class Category_itemModule {}
