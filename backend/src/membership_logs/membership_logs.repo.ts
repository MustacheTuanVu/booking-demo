import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  Membership_logs,
  Membership_logsDocument,
} from 'src/membership_logs/schema/membership_logs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { GetAnalytics } from 'src/analytics/dto/getByCondition.dto';

@Injectable()
export class Membership_logsRepo {
  private readonly _membership_logsModel: Model<Membership_logsDocument>;
  constructor(
    @InjectModel(Membership_logs.name)
    membership_logsModel: Model<Membership_logsDocument>,
  ) {
    this._membership_logsModel = membership_logsModel;
  }

  async createMembership_logs(data: any): Promise<Membership_logsDocument> {
    return await this._membership_logsModel.create(data);
  }

  async createManyMembership_logs(data: any): Promise<any> {
    return await this._membership_logsModel.insertMany(data);
  }

  async findMembership_logsById(id: any): Promise<Membership_logsDocument> {
    return await this._membership_logsModel.findById(id);
  }

  async findOneMembership_logsByCondition(
    condition: any,
  ): Promise<Membership_logsDocument> {
    return await this._membership_logsModel.findOne(condition);
  }

  async findMembership_logsByCondition(condition: any): Promise<any> {
    return await this._membership_logsModel.find(condition);
  }

  async updateMembership_logs(
    id: any,
    data: any,
  ): Promise<Membership_logsDocument> {
    return await this._membership_logsModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteMembership_logs(id: any) {
    return await this._membership_logsModel.findByIdAndDelete(id);
  }

  async getInfoAnalytics(condition: GetAnalytics) {
    const query: any = {};
    if (condition.type) {
      query.type = condition.type;
    }
    if (condition.time_from && condition.time_to) {
      query['createdAt'] = {
        $gte: new Date(condition.time_from),
        $lte: new Date(condition.time_to),
      };
    }

    // Tính tổng price
    const result = await this._membership_logsModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    return {
      total: result.length > 0 ? result[0].total : 0, // Nếu không có data, trả về 0
    };
  }

  async getMembershipRevenueByPeriod(start: Date, end: Date): Promise<number> {
    const matchCondition: any = { type: 'MEMBERSHIP' };

    // Nếu có khoảng thời gian, thêm điều kiện cho trường createdAt
    if (start && end) {
      matchCondition.createdAt = { $gte: start, $lte: end };
    }

    // Xây dựng pipeline aggregation: 
    // 1. Lọc theo điều kiện (match)  
    // 2. Nhóm các đơn hàng và tính tổng trường total_price
    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ];
    console.log('getMembershipRevenueByPeriod', pipeline)
    const result = await this._membership_logsModel.aggregate(pipeline);
    return result.length > 0 ? result[0].total : 0;
  }

  async getMembershipLogListForAnalytics(start: Date, end: Date): Promise<any[]> {
    const query: any = {};
    if (start && end) {
      query.createdAt = { $gte: start, $lte: end };
    }
    return await this._membership_logsModel.find(query, { _id: 1, createdAt: 1, price: 1 }).exec();
  }

  // Get danh sách log theo user id
  async getMembershipLogsByUserId(uid: string): Promise<any[]> {
    return await this._membership_logsModel.find({ uid: uid }).exec();
  }
}
