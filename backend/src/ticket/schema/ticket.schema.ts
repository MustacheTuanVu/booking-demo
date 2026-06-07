
import { Injectable } from "@nestjs/common";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { UserRole } from "src/users/enum/role.enum";
import { StatusTicket } from "../enum/status.enum";

@Schema({
  timestamps: true
})
export class Ticket {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  uid: string;

  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: String, default: UserRole.ADMIN }) 
  for: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  price: string;

  @Prop({ required: true, type: String, default: StatusTicket.PENDING })
  status: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  handler_id: string;
}

export type TicketDocument = Ticket & Document;
export const TicketSchema = SchemaFactory.createForClass(Ticket);

