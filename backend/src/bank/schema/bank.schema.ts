
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Bank {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    uid: string;

    @Prop({ required: true, type: String })
    bankCode: string;

    @Prop({ required: true, type: String })
    bankName: string;

    @Prop({ required: true, type: String })
    accountNumber: string

    @Prop({ required: true, type: String })
    accountHolderName: string
}

export type BankDocument = Bank & Document;
export const BankSchema = SchemaFactory.createForClass(Bank);

