import { Injectable } from '@nestjs/common';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

class ComboItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  itemId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  desc?: string;

  @Prop({ type: String })
  ingredient?: string;

  @Prop({ type: String })
  category_id?: string;

  @Prop({ type: String })
  type?: string;

  @Prop({ type: String })
  unit?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String })
  code_cukcuk?: string;

  @Prop({ type: String })
  item_id_cukcuk?: string;

  @Prop({ type: String })
  item_name_cukcuk?: string;
}

class ComboInfo {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  comboId: string;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: Number, required: false })
  price: number;

  @Prop({ type: Number, required: false })
  size_seat: number;

  @Prop({ type: Number, required: false })
  size_food: number;

  @Prop({ type: Number, required: false })
  size_drink: number;

  @Prop({ type: [ComboItem], required: true })
  items: ComboItem[];
}


@Schema({
  timestamps: true,
})
export class Order_detail {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  order_id: string;

  @Prop({ type: [ComboInfo], required: true })
  combo_info: ComboInfo[];

  @Prop({ required: false, type: [ComboItem] })
  item_upsell: ComboItem[];

  @Prop({ required: false, type: Number })
  j_size: number;

  @Prop({ required: false, type: Number })
  q_size: number;

  @Prop({ required: false, type: Number })
  k_size: number;
}

export type Order_detailDocument = Order_detail & Document;
export const Order_detailSchema = SchemaFactory.createForClass(Order_detail);
