import { Menu_itemRepo } from './menu_item.repo';
import { Menu_item, Menu_itemSchema } from './schema/menu_item.schema';
import { Menu_itemService } from './menu_item.service';
import { Menu_itemController } from './menu_item.controller';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Category_itemModule } from 'src/category_item/category_item.module';
import { MediaModule } from 'src/media/media.module';

@Module({
    imports: [
        UsersModule,
        MongooseModule.forFeature([{ name: Menu_item.name, schema: Menu_itemSchema }]),
        Category_itemModule,
        MediaModule,
    ],
    controllers: [Menu_itemController],
    providers: [Menu_itemService, Menu_itemRepo],
    exports: [Menu_itemService, Menu_itemRepo],
})
export class Menu_itemModule {}
