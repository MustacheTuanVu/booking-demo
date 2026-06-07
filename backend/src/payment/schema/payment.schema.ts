
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { OrderStatus } from "src/orders/enum/status.enum";

@Schema({
  timestamps: true
})
export class Payment {
    // @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    // _id: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    order_id: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    uid: string;

    @Prop({ required: false, type: String })
    payment_method: string;

    @Prop({ required: true, type: String, default: OrderStatus.PENDING })
    status: string;

    @Prop({ required: false, type: String })
    note: string;

    @Prop({ required: false })
    bankCode: string;

    @Prop({ required: true, unique: true })
    txnRef: string;

    @Prop({ required: true })
    amount: number;

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

export type PaymentDocument = Payment & Document;
export const PaymentSchema = SchemaFactory.createForClass(Payment);

