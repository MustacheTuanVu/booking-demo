
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Showtimes {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'events' })
  event_id: string;

  @Prop({ required: true, type: Date })
  time_start: Date;

  @Prop({ required: true, type: Date })
  time_end: Date;
}

export type ShowtimesDocument = Showtimes & Document;
export const ShowtimesSchema = SchemaFactory.createForClass(Showtimes);

