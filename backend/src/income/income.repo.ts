import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Income, IncomeDocument } from 'src/income/schema/income.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IncomeCondition } from './dto/condition.dto';
import { UpdateUserIncome } from './dto/updateUser.dto';

@Injectable()
export class IncomeRepo {
  private readonly _incomeModel: Model<IncomeDocument>;
  constructor(@InjectModel(Income.name) incomeModel: Model<IncomeDocument>) {
    this._incomeModel = incomeModel;
  }

  async createIncome(data: any): Promise<IncomeDocument> {
    return await this._incomeModel.create(data);
  }

  async createManyIncome(data: any): Promise<any> {
    return await this._incomeModel.insertMany(data);
  }

  async findIncomeById(id: any): Promise<IncomeDocument> {
    return await this._incomeModel.findById(id);
  }

  async findOneIncomeByCondition(condition: any): Promise<IncomeDocument> {
    return await this._incomeModel.findOne(condition);
  }

  async findIncomeByCondition(condition: any): Promise<any> {
    return await this._incomeModel.find(condition);
  }

  async updateIncome(id: any, data: any): Promise<IncomeDocument> {
    return await this._incomeModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteIncome(id: any) {
    return await this._incomeModel.findByIdAndDelete(id);
  }

  async getIncomeByCondition(condition: IncomeCondition) {
    const query: any = {};

    if (condition.query) {
      const regex = new RegExp(condition.query, 'i');
      query.$or = [{ name: { $regex: regex } }];
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

    const income = await this._incomeModel
      .aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'incom_id',
            as: 'UserInfo',
          },
        },
        {
          $addFields: {
            userCount: { $size: '$UserInfo' },
          },
        },
        {
            $project: {
                UserInfo: 0
            }
        }
      ])
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await this._incomeModel.countDocuments(query);

    return {
      income,
      total,
      condition: condition.page,
      limit,
    };
  }
}
