import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VNPayTransactionController } from './vnp_transaction.controller';
import { VNPayTransactionService } from './vnp_transaction.service';
import { VNPayTransactionRepo } from './vnp_transaction.repo';
import { UsersModule } from 'src/users/users.module'; // Import UsersModule
import { VNPayTransactions, VNPayTransactionsSchema } from './schema/vnp_transactions.scheme';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VNPayTransactions.name, schema: VNPayTransactionsSchema }]),
    UsersModule,  // Thêm UsersModule để cung cấp UsersService cho RolesGuard
    OrdersModule
  ],
  controllers: [VNPayTransactionController],
  providers: [VNPayTransactionService, VNPayTransactionRepo],
  exports: [VNPayTransactionService, VNPayTransactionRepo]
})
export class VNPayTransactionsModule {}
