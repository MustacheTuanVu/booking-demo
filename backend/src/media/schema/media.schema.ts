
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Media {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
    uid: string;

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
    relative_id: string;

    @Prop({ required: true, type: String })
    type: string;

    @Prop({ required: true, type: String })
    link: string;

}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);

