import {BankRepo } from './bank.repo';import { Bank, BankSchema } from './schema/bank.schema';import { BankService } from './bank.service';import { BankController } from './bank.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Bank.name, schema: BankSchema}])],
    controllers: [BankController],
    providers: [BankService, BankRepo],
    exports: [BankService, BankRepo]
})
export class BankModule {}

