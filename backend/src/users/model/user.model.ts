import { BaseModel } from "src/common/model/base.model";

export class UserModel extends BaseModel {
  _id?: string;
  phone?: string;
  cukcuk_id?: string;
  name?: string;
  avatar?: string;
  identity_number?: string;
  address?: string;
  email?: string;
  role?: string;
  guest?: string;
  referral_code?: string;
  customer_type?: string;
  customer_type_expiry?: Date;
  google_id?: string;
  point?: string;
  incom_id?: string;
  BankInfo?: string;
  IncomInfo?: string;
  createAt?: Date;
  updateAt?: Date;
  isDelete?: any

  constructor(user: any) {
    super(user);
    this._id = user?._id;
    this.phone = user?.phone;
    this.cukcuk_id = user?.cukcuk_id;
    this.name = user?.name; // Sửa lại đây cho đúng với thuộc tính 'name'
    this.avatar = user?.avatar;
    this.identity_number = user?.identity_number;
    this.address = user?.address;
    this.email = user?.email;
    this.role = user?.role;
    this.google_id = user?.google_id;
    this.guest = user?.guest;
    this.point = user?.point;
    this.referral_code = user?.referral_code;
    this.customer_type = user?.customer_type;
    this.customer_type_expiry = user?.customer_type_expiry;
    this.incom_id = user?.incom_id;
    this.BankInfo = user?.BankInfo;
    this.IncomInfo = user?.IncomInfo;
    this.createAt = user?.createAt;
    this.updateAt = user?.updateAt; // Sửa lại đây cho đúng với thuộc tính 'updateAt'
    this.isDelete = user?.isDelete
  }
}
