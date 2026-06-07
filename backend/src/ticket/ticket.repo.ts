import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from 'src/ticket/schema/ticket.schema';
import { InjectModel } from '@nestjs/mongoose';
import { StringUtils } from 'src/common/utils/string.utils';
import { TicketCondition } from './dto/condition.dto';

@Injectable()
export class TicketRepo {
  private readonly _ticketModel: Model<TicketDocument>;
  constructor(@InjectModel(Ticket.name) ticketModel: Model<TicketDocument>) {
    this._ticketModel = ticketModel;
  }

  async createTicket(data: any): Promise<TicketDocument> {
    return await this._ticketModel.create(data);
  }

  async createManyTicket(data: any): Promise<any> {
    return await this._ticketModel.insertMany(data);
  }

  async findTicketById(id: any): Promise<TicketDocument> {
    return await this._ticketModel.findById(id);
  }

  async findOneTicketByCondition(condition: any): Promise<TicketDocument> {
    return await this._ticketModel.findOne(condition);
  }

  async findTicketByCondition(condition: any): Promise<any> {
    return await this._ticketModel.find(condition);
  }

  async updateTicket(id: any, data: any): Promise<TicketDocument> {
    return await this._ticketModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTicket(id: any) {
    return await this._ticketModel.findByIdAndDelete(id);
  }

  async ownerTicket(idTicket, uid) {
    return await this._ticketModel.findOne({
      _id: StringUtils.ObjectId(idTicket),
      uid: uid,
    });
  }

  async getTicketsByCondition(condition: TicketCondition, uid?) {
    const query: any = {};
    if (condition.status) {
      query.status = condition.status;
    }

    if(condition.type){
      query.type = condition.type;
    }

    if (condition.query) {
      const regex = new RegExp(condition.query, 'i');
      query.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
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

    if (uid) {
      query.uid = uid;
    }

    const tickets = await this._ticketModel
      .find(query)
      .populate({ path: 'uid', select: '-password -google_id' })
      .populate({ path: 'handler_id', select: '-password -google_id' })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await this._ticketModel.countDocuments(query);

    return {
      tickets,
      total,
      condition: condition.page,
      limit,
    };
  }

  async getInfoTicketByID(id) {
    return await this._ticketModel
      .findById(id)
      .populate({ path: 'uid', select: '-password -google_id' })
      .populate({ path: 'handler_id', select: '-password -google_id' })
      .exec();
  }
}
