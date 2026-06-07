import { Injectable } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './model/user.model';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { CustomerType } from './enum/type.enum';
import { GetRevenueReportDto } from 'src/analytics/dto/getRevenueReport.dto';
import { TypeQuery } from 'src/analytics/enum/type.dto';
import { UserRole } from './enum/role.enum';
import { getUserByCondition } from 'src/analytics/dto/getUserByCondition.dto';
import { UserCondition } from './dto/condition.dto';

@Injectable()
export class UsersRepo {
  private readonly _userModel: Model<UserDocument>;

  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    this._userModel = userModel;
  }

  async createUser(data: any): Promise<UserDocument> {
    return await this._userModel.create(data);
  }

  async getUsersByCondition(condition: UserCondition) {

    const query: any = {};

    if(condition.status){
      query.isDelete = condition.status;
    }

    if(condition.role){
      query.role = condition.role;
    }

    if (condition.query) {
      const regex = new RegExp(condition.query, 'i');
      query.$or = [
        { name: { $regex: regex } },
        { phone: { $regex: regex } },
      ];
    }
  
    if (condition.time_from && condition.time_to) {
      query.createdAt = {
        $gte: new Date(condition.time_from),
        $lte: new Date(condition.time_to),
      };
    }

    const limit = condition.limit || 10;
    const skip = (condition.page - 1) * limit || 0;

    const sort: any = {};
    if (condition.orderBy) {
      const [field, order] = condition.orderBy.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
  
    const users = await this._userModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'banks',
          localField: '_id',
          foreignField: 'uid',
          as: 'BankInfo',
        }
      },
      {
        $lookup: {
          from: 'incomes',
          localField: 'incom_id',
          foreignField: '_id',
          as: 'IncomInfo'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
  
    const userModels = users.map((user) => new UserModel(user));
  
    const total = await this._userModel.countDocuments(query);
  
    return {
      userModels,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: condition.page,
    };
  }
  
  async findByCondition(condition){
    return await this._userModel.find(condition);
  }

  async getStaffByCondition(condition: PaginationDto) {
    const { page, limit, query } = condition;
    const skip = (page - 1) * limit;
    let searchCondition = {};

    // Nếu query là chuỗi và bắt đầu bằng dấu [ thì cố gắng parse thành mảng
    if (typeof query === 'string' && query.trim().startsWith('[')) {
      try {
        // Thay thế dấu nháy đơn bằng dấu nháy kép nếu cần
        const fixedQuery = query.replace(/'/g, '"');
        const parsed = JSON.parse(fixedQuery);
        if (Array.isArray(parsed)) {
          searchCondition = { role: { $in: parsed } };
        }
      } catch (e) {
        console.error('Lỗi parse query', e);
        // Nếu parse thất bại, fallback về tìm kiếm regex theo chuỗi query
        const regex = new RegExp(query, 'i');
        searchCondition = {
          $or: [{ name: { $regex: regex } }, { phone: { $regex: regex } }],
        };
      }
    } else if (Array.isArray(query)) {
      // Nếu query đã là mảng
      searchCondition = { role: { $in: query } };
    } else {
      // Nếu query là chuỗi thông thường
      const regex = new RegExp(query, 'i');
      searchCondition = {
        $or: [
          { name: { $regex: regex } },
          { phone: { $regex: regex } },
          { role: { $regex: regex } },
        ],
      };
    }

    const users = await this._userModel.aggregate([
      { $match: searchCondition },
      {
        $lookup: {
          from: 'incomes',
          localField: 'incom_id',
          foreignField: '_id',
          as: 'IncomInfo'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const userModels = users.map((user) => new UserModel(user));
    const total = await this._userModel.countDocuments(searchCondition);

    return {
      userModels,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async updatePointUser(uid: string, point: number) {
    return await this._userModel.findOneAndUpdate(
      { _id: uid },
      { $inc: { point: point } },
      { new: true },
    ).select('-password');
  }

  async updateMany(uids: string[], data: any) {
    return await this._userModel.updateMany(
      { _id: { $in: uids } },
      { $set: data },
    );
  }

  async getUserReferred(referred: string) {
    return await this._userModel.findOne({
      $or: [
        { phone: referred },
        { email: referred },
        { referral_code: referred },
      ],
    }).populate('incom_id');
  }

  async updateUser(uid: any, data: any): Promise<UserDocument> {
    return await this._userModel.findByIdAndUpdate(uid, data, { new: true });
  }

  async updateUserByCondition(condition: any, data: any){
    return await this._userModel.findOneAndUpdate(condition, data, {new: true});
  }

  async updateByPhone(phone, data: any) {
    return await this._userModel.updateOne({ phone: phone }, data);
  }

  async findByPhone(phone: string): Promise<UserDocument> {
    return await this._userModel.findOne({
      $or: [{ phone: phone }, { email: phone }, { google_id: phone }],
    });
  }

  async findById(uid: any): Promise<UserDocument> {
    return await this._userModel.findById(uid);
  }

  async findInfoByPhone(phone){
    return await this._userModel.aggregate([
      {
        $match: {
          $or: [{ phone }, { email: phone }, { google_id: phone }],
        }
      },
      {
        $lookup: {
          from: 'banks',
          localField: '_id',
          foreignField: 'uid',
          as: 'BankInfo'
        }
      },
      {
        $lookup: {
          from: 'incomes',
          localField: 'incom_id',
          foreignField: '_id',
          as: 'IncomInfo'
        }
      },
      {
        $unwind: {
          path: '$IncomInfo',
          preserveNullAndEmptyArrays: true
        }
      }
    ])
  }

  async updateIdSocketForUser(phone, idSocket) {
    return await this._userModel.findOneAndUpdate(
      { phone: phone },
      { $push: { idWebSocket: idSocket } },
      { new: true },
    );
  }

  async deleteIdSocketForUser(phone: string, idSocket: string) {
    return await this._userModel.findOneAndUpdate(
      { phone: phone },
      { $pull: { idWebSocket: idSocket } },
      { new: true },
    );
  }

  // Hàm mới để tìm kiếm user theo google_id (cho Google OAuth)
  async findByGoogleId(googleId: string): Promise<UserDocument> {
    return await this._userModel.findOne({ 
      $or: [{ phone: googleId }, { email: googleId }, {google_id: googleId}], 
    });
  }
  async resetExpiredCustomerTypes() {
    const now = new Date();

    // Đặt mốc thời gian chỉ tính theo ngày (00:00:00)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const result = await this._userModel.updateMany(
      {
        customer_type: { $ne: CustomerType.J },
        customer_type_expiry: { $lte: today }, // So sánh chỉ theo ngày
      },
      {
        $set: { customer_type: CustomerType.J, customer_type_expiry: null },
      },
    );

    console.log(`✅ Đã cập nhật ${result.modifiedCount} user.`);
    return result.modifiedCount;
  }

  async resetExpiredCustomerGuest() {
    const now = new Date();

    const result = await this._userModel.updateMany(
      {
        'guest.is_guest': true, // Chỉ xử lý những thằng đang là guest
        'guest.expiry': { $lte: now }, // Hết hạn thì reset
      },
      {
        $set: {
          'guest.is_guest': false, // Chuyển về user thường
          'guest.expiry': null, // Xóa ngày hết hạn
        },
      },
    );

    console.log(`✅ Đã cập nhật ${result.modifiedCount} user.`);
    return result.modifiedCount;
  }

  async deleteUser(uid){
    await this._userModel.findByIdAndDelete(uid);
  }

  async findOneByGmailOrPhone(phone: string, email): Promise<UserDocument> {
    return await this._userModel.findOne({
      $or: [{ phone: phone }, { email: email }],
    });
  }

  async getRevenueReportForStaffOrCustomer(condition: getUserByCondition) {
    const query: any = {};

    if(condition.status){
      query.isDelete = condition.status;
    }

    if (condition.query) {
      const regex = new RegExp(condition.query, 'i');
      query.$or = [
        { name: { $regex: regex } },
        { phone: { $regex: regex } },
        { email: { $regex: regex } },
      ];
    }
    query.incom_id = { $exists: true, $ne: null };
    const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = (condition.page ? (condition.page - 1) * limit : 0);

        const lookupStage = condition.time_from && condition.time_to
        ? {
            $lookup: {
                from: 'orders',
                let: { referral_code: '$referral_code' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$referred_by', '$$referral_code'] },
                                    { $gte: ['$createdAt', new Date(condition.time_from)] }, // Lọc theo thời gian bắt đầu
                                    { $lte: ['$createdAt', new Date(condition.time_to)] }, // Lọc theo thời gian kết thúc
                                ],
                            },
                        },
                    },
                ],
                as: 'OrderInfo',
            },
        }
        : {
            $lookup: {
                from: 'orders',
                localField: 'referral_code',
                foreignField: 'referred_by',
                as: 'OrderInfo',
            },
        };

    if (condition.type) {
      switch (condition.type) {
        case TypeQuery.CUSTOMER:
            query.role = UserRole.USER
          break;
        case TypeQuery.STAFF:
            query.role = UserRole.ADMIN
          break;
        default:
          break;
      }
    }

    const total = await this._userModel.countDocuments(query);

    const data = await this._userModel.aggregate([
        {
            $match: query
        },
        lookupStage,
        {
            $addFields: {
                totalOrderPrice: { $sum: '$OrderInfo.total_price' }, // Tính tổng tiền
                totalOrders: { $size: '$OrderInfo' }
            },
        },
        {
          $lookup: {
            from: 'banks',
            localField: '_id',
            foreignField: 'uid',
            as: 'BankInfo'
          }
        },
        {
            $project: {
                // OrderInfo: 0,
                password: 0,
                idWebSocket: 0,
                google_id: 0
            },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },

    ])

    return {
      data: data,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: condition.page,
    }

  }

  async findOneByCondition(condition: any): Promise<UserDocument | null> {
    return await this._userModel.findOne(condition);
  }
}
