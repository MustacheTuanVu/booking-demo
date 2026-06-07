
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { MenuOrderType } from "../enum/type.enum";
import { Status } from "src/common/enum/status.enum";

@Schema({
  timestamps: true
})
export class Menu_order {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    // name of the menu
    @Prop({ required: true, type: String })
    name: string;

    // description of the menu
    @Prop({ required: true, type: String })
    description: string;

    //type of the menu
    @Prop({ required: true, type: String, enum: MenuOrderType, default: MenuOrderType.COMBO })
    type: string;

    // link image
    @Prop({ required: false, type: String })
    image: string;

    // item aray id menu item
    @Prop({ required: true, type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu_item' }] })
    items: string[];

    // status of the menu
    @Prop({ required: true, type: String, default: Status.ACTIVE })
    status: string;

}

export type Menu_orderDocument = Menu_order & Document;
export const Menu_orderSchema = SchemaFactory.createForClass(Menu_order);

