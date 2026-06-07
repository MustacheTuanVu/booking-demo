
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { TypePromotion } from "src/promotion/enum/type.enum";

@Schema({
  timestamps: true
})
export class Income {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    _id: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: String })
    desc: string;

    @Prop({ required: true, type: String, default: TypePromotion.PERCENT })
    type_price: string;

    @Prop({ required: true, type: Number })
    price: number;
}

export type IncomeDocument = Income & Document;
export const IncomeSchema = SchemaFactory.createForClass(Income);

