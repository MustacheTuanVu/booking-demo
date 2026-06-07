
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Status } from "src/common/enum/status.enum";

@Schema({
  timestamps: true
})
export class Combo_event {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    @Prop({required: true, type: String})
    name: string;

    @Prop({required: true, type: Number})
    size_seat: number;

    @Prop({required: true, type: Number})
    size_food: number;

    @Prop({required: true, type: Number})
    size_drink: number;

    @Prop({required: true, type: Number})
    price: number;

    @Prop({required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Menu_item'})
    menu_id: string;

    @Prop({required: true, type: String, default: Status.ACTIVE})
    status: string;

    @Prop({required: false, type: Number})
    price_origin: number;

    @Prop({required: false, type: Boolean, default: true})
    is_show_upsell: boolean;
  }

export type Combo_eventDocument = Combo_event & Document;
export const Combo_eventSchema = SchemaFactory.createForClass(Combo_event);

