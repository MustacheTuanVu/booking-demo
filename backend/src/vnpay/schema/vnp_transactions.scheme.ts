import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({
  timestamps: true
})
export class VNPayTransactions {
  @Prop({ required: true, unique: true })
  txnRef: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  orderId: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  userId: string;

  @Prop({ required: false })
  bankCode: string;

  @Prop({ required: false })
  ipAddr: string;

  @Prop({ required: false })
  responseCode: string;

  @Prop({ required: false })
  transactionStatus: string;

  @Prop({ required: false })
  secureHash: string;

  @Prop({ required: false })
  payDate: string;

  @Prop({ required: false })
  bankTranNo: string;
}

export type VNPayTransactionsDocument = VNPayTransactions & Document;
export const VNPayTransactionsSchema = SchemaFactory.createForClass(VNPayTransactions);
