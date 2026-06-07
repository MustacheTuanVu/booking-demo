import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserRole } from './enum/role.enum';
import { UserStatus } from './enum/status.enum';
import { UserState } from './enum/state.enum';
import { CustomerType } from './enum/type.enum';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
})
export class User {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: string;

    @Prop({ required: false, type: String })
    phone: string;

    @Prop({ required: false, type: String })
    cukcuk_id: string;

    @Prop({ required: false, type: String })
    google_id: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: String })
    avatar: string;

    @Prop({ required: true, type: String })
    email: string;

    @Prop({ required: false, type: String })
    address: string;

    @Prop({ required: false, type: String })
    identity_number: string;

    @Prop({ required: true, type: String, default: UserRole.USER })
    role: string;

    @Prop({ required: false, type: { is_guest: Boolean, expiry: Date } })
    guest: { is_guest: boolean; expiry: Date };

    @Prop({ required: false, type: [String] })
    idWebSocket: string[];

    @Prop({ required: true, type: String, default: UserState.OFFLINE })
    state: string;

    @Prop({ required: false, type: String })
    referral_code: string;

    @Prop({ required: true, type: String, default: CustomerType.J })
    customer_type: string;

    @Prop({ type: Date, default: null }) // Hạn dùng của hạng thẻ
    customer_type_expiry: Date;

    @Prop({ required: false, type: String })
    password: string;

    @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Income' })
    incom_id: string;

    @Prop({ required: false, type: Number })
    point: number;

    @Prop({ required: false, type: String, default: UserStatus.NOT_VERIFY })
    isDelete: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
