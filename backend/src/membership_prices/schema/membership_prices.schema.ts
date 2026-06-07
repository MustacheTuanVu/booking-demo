
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Membership_prices {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    @Prop({ required: true, type: String })
    type: string;

    @Prop({ required: true, type: Number })
    priceInMonth: number

    @Prop({ required: true, type: String, enum: ['month', 'year'], default: 'month' })
    duration: string;
}

export type Membership_pricesDocument = Membership_prices & Document;
export const Membership_pricesSchema = SchemaFactory.createForClass(Membership_prices);

