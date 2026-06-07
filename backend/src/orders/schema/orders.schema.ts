
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { OrderStatus } from "../enum/status.enum";

@Schema({
  timestamps: true
})
export class Orders {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  uid: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  event_id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  showtimes_id: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  employee_id: string;

  @Prop({ required: true, type: String })
  code: string;

  @Prop({ required: false, type: Object })
  promotion: any;

  @Prop({ required: true, type: Number })
  total_price: number;

  @Prop({ required: false, type: Number })
  point_order: number;

  @Prop({ required: false, type: Number })
  point_referred: number;

  @Prop({ required: false, type: String })
  note: string;

  @Prop({ required: false, type: String })
  referred_by: string;

  @Prop({ required: true, type: String, default: OrderStatus.PENDING })
  status: string;
}

export type OrdersDocument = Orders & Document;
export const OrdersSchema = SchemaFactory.createForClass(Orders);

