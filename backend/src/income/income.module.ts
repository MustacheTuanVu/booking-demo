import {IncomeRepo } from './income.repo';import { Income, IncomeSchema } from './schema/income.schema';import { IncomeService } from './income.service';import { IncomeController } from './income.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Income.name, schema: IncomeSchema}])],
    controllers: [IncomeController],
    providers: [IncomeService, IncomeRepo],
    exports: [IncomeService, IncomeRepo]
})
export class IncomeModule {}

