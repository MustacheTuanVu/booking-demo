
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Seat_section {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  event_id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  seat_id: string;

  @Prop({ required: true, type: Number })
  size: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: Object })
  data_seat: any;

  @Prop({ required: false, type: Date })
  j_booking_start: Date;

  @Prop({ required: false, type: Date })
  q_booking_start: Date;

  @Prop({ required: false, type: Date })
  k_booking_start: Date;

  @Prop({ required: false, type: Date })
  g_booking_start: Date;

  @Prop({ required: true, type: Date })
  time_end: Date;
}

export type Seat_sectionDocument = Seat_section & Document;
export const Seat_sectionSchema = SchemaFactory.createForClass(Seat_section);

