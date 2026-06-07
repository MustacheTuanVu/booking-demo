
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Category_item {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: String,
    //  unique: true 
    })
  code: string;

  @Prop({ required: false, type: String })
  image: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: false, type: String})
  category_id_cukcuk: string;

  @Prop({ required: false, type: String })
  category_name_cukcuk: string;
}

export type Category_itemDocument = Category_item & Document;
export const Category_itemSchema = SchemaFactory.createForClass(Category_item);

