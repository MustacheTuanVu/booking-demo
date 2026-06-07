import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Event {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  type_event: string;

  @Prop({ required: true })
  venue: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  category_id: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: false })
  banner: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Combo Order' }],
  })
  combo_ids: string[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  seat_map_id: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: false, type: Boolean, default: true })
  show_artists: boolean;

  @Prop({ required: false, type: String })
  custom_artists_text: string;
}

export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);
