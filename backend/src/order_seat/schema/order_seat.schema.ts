
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Order_seat {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  order_id: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: false, type: String })
  seat_cukcuk_id: string;

  @Prop({ required: true, type: String })
  seat_id: string;

  @Prop({ required: true, type: String })
  name_seat: string;
}

export type Order_seatDocument = Order_seat & Document;
export const Order_seatSchema = SchemaFactory.createForClass(Order_seat);

