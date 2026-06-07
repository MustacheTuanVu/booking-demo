
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Status } from "src/common/enum/status.enum";

@Schema({
  timestamps: true
})
export class Category_event {
  
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  slug: string;

  @Prop({ required: true, type: String, default: Status.ACTIVE })
  status: string;
}

export type Category_eventDocument = Category_event & Document;
export const Category_eventSchema = SchemaFactory.createForClass(Category_event);

