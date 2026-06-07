import { Module } from '@nestjs/common';
import { ToolExcelController } from './tool-excel.controller';
import { ToolExcelService } from './tool-excel.service';
import { UsersModule } from 'src/users/users.module';
import { Menu_itemModule } from 'src/menu_item/menu_item.module';
import { Category_itemModule } from 'src/category_item/category_item.module';
import { PromotionModule } from 'src/promotion/promotion.module';
import { MediaModule } from 'src/media/media.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { BankModule } from 'src/bank/bank.module';

@Module({
  imports: [UsersModule, Menu_itemModule, Category_itemModule, PromotionModule, MediaModule, TicketModule, BankModule],
  controllers: [ToolExcelController],
  providers: [ToolExcelService]
})
export class ToolExcelModule {}
