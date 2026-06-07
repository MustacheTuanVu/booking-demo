
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Membership_logs {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    uid: string;

    @Prop({ required: true, type: String })
    type: string;

    @Prop({ required: true, type: Number })
    price: number;

}

export type Membership_logsDocument = Membership_logs & Document;
export const Membership_logsSchema = SchemaFactory.createForClass(Membership_logs);

