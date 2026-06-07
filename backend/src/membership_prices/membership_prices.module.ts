import {Membership_pricesRepo } from './membership_prices.repo';import { Membership_prices, Membership_pricesSchema } from './schema/membership_prices.schema';import { Membership_pricesService } from './membership_prices.service';import { Membership_pricesController } from './membership_prices.controller';
import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [forwardRef(() =>UsersModule), MongooseModule.forFeature([{name: Membership_prices.name, schema: Membership_pricesSchema}])],
    controllers: [Membership_pricesController],
    providers: [Membership_pricesService, Membership_pricesRepo],
    exports: [Membership_pricesService, Membership_pricesRepo]
})
export class Membership_pricesModule {}

