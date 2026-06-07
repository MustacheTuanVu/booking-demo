
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Artists {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: false, type: String })
  bio: string;

  @Prop({ required: false, type: String })
  image: string;

  @Prop({ required: false, type: String })
  link: string;
}

export type ArtistsDocument = Artists & Document;
export const ArtistsSchema = SchemaFactory.createForClass(Artists);

