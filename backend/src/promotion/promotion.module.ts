import {PromotionRepo } from './promotion.repo';import { Promotion, PromotionSchema } from './schema/promotion.schema';import { PromotionService } from './promotion.service';import { PromotionController } from './promotion.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Promotion.name, schema: PromotionSchema}])],
    controllers: [ PromotionController],
    providers: [ PromotionService, PromotionRepo],
    exports: [ PromotionService, PromotionRepo]
})
export class PromotionModule {}

