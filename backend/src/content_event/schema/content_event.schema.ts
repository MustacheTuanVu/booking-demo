
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Content_event {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  event_id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  artist_id: string;

  @Prop({ required: false, type: String })
  desc: string;

  @Prop({ required: false, type: Date })
  time: Date;

  @Prop({ required: true, type: String })
  status: string;


}

export type Content_eventDocument = Content_event & Document;
export const Content_eventSchema = SchemaFactory.createForClass(Content_event);

