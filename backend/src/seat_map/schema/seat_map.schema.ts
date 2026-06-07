
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Seat_map {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Object })
  data_seat: {
      name: string;
      id: string;
      cukcuk_id: string;
  };

  @Prop({ required: false, type: Boolean, default: false })
  booked: boolean;
}

export type Seat_mapDocument = Seat_map & Document;
export const Seat_mapSchema = SchemaFactory.createForClass(Seat_map);

