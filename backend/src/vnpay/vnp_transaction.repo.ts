import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { VNPayTransactions, VNPayTransactionsDocument } from "./schema/vnp_transactions.scheme";

@Injectable()
export class VNPayTransactionRepo {
  constructor(
    @InjectModel(VNPayTransactions.name)
    private readonly vnpTransactionModel: Model<VNPayTransactionsDocument>
  ) {}

  async createTransaction(data: any): Promise<VNPayTransactionsDocument> {
    return await this.vnpTransactionModel.create(data);
  }

  async findTransactionById(id: any): Promise<VNPayTransactionsDocument> {
    return await this.vnpTransactionModel.findById(id);
  }

  async findTransactionByCondition(condition: any): Promise<VNPayTransactionsDocument> {
    return await this.vnpTransactionModel.findOne(condition);
  }

  async updateTransaction(id: any, data: any): Promise<VNPayTransactionsDocument> {
    return await this.vnpTransactionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTransaction(id: any): Promise<VNPayTransactionsDocument> {
    return await this.vnpTransactionModel.findByIdAndDelete(id);
  }
}
