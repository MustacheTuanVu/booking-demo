
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Status } from "src/common/enum/status.enum";

@Schema({
  timestamps: true
})
export class Menu_item {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: false, type: String })
  desc: string;

  @Prop({ required: false, type: String })
  ingredient: string;

  @Prop({ required: false, type: [{ name: String, description: String, icon: String, color: String }] })
  flavor: { name: string; description: string; icon: string, color: string }[];

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Category_item' })
  category_id: string;

  @Prop({ required: false, type: String })
  type: string;

  @Prop({ required: false, type: String })
  unit: string;

  @Prop({ required: false, type: String })
  image: string;

  @Prop({ required: true, type: String, default: Status.ACTIVE })
  status: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: false, type: String })
  code_cukcuk: string;

  @Prop({ required: false, type: String })
  item_id_cukcuk: string;

  @Prop({ required: false, type: String })
  item_name_cukcuk: string;

  @Prop({ required: false, type: String })
  unit_id_cukcuk: string;

  @Prop({ required: false, type: String })
  unit_name_cukcuk: string;

}

export type Menu_itemDocument = Menu_item & Document;
export const Menu_itemSchema = SchemaFactory.createForClass(Menu_item);

