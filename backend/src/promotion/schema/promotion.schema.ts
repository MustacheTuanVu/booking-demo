import { Injectable } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Status } from "src/common/enum/status.enum";
import { TypePromotion } from "../enum/type.enum";

// Interface cho thông tin người sử dụng promotion
export interface UsedByInfo {
  user_id: string;
  used_at: Date;
}

// Interface cho lịch sử mua promotion
export interface PurchaseHistoryItem {
  ctv_id: string;
  code: string
  purchase_date: Date;
  used_by?: UsedByInfo;
  status: string;
}

@Schema({
  timestamps: true
})
export class Promotion {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  uid: string;

  @Prop({ required: true, type: String, unique: true })
  code: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: false, type: String })
  desc: string;

  @Prop({ required: true, type: Date })
  expired: Date;

  @Prop({ required: true, type: String, default: Status.ACTIVE })
  status: string;

  @Prop({ required: true, type: String, default: TypePromotion.PERCENT })
  type_price: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  required_points: number;

  @Prop({ required: true, type: Number })
  max_quantity: number;

  @Prop({ required: true, type: Number })
  total: number;

  @Prop({ required: false, type: String })
  for: string;

  @Prop({ required: true, type: String, enum: ['Hạng thẻ', 'CTV', 'ALL', 'Khách hàng cụ thể'] })
  for_type: string;

  @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId] })
  user_list: string[];
  
  @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'Users', default: [] })
  purchased_by: string[];

  @Prop({ 
    required: false, 
    type: [{
      ctv_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      code: { type: String, unique: true },
      purchase_date: { type: Date },
      used_by: {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        used_at: { type: Date }
      },
      status: { type: String, enum: ['ACTIVE', 'USED', 'LOCKED'] }
    }],
    default: []
  })
  purchase_history: PurchaseHistoryItem[];
}

export type PromotionDocument = Promotion & Document;
export const PromotionSchema = SchemaFactory.createForClass(Promotion);

