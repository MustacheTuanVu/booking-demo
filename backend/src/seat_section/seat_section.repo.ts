
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Seat_section, Seat_sectionDocument } from "src/seat_section/schema/seat_section.schema";
import { InjectModel } from "@nestjs/mongoose";
import { StringUtils } from "src/common/utils/string.utils";
import { GetSeatSectionByCondition } from "./dto/condition.dto";


@Injectable()
export class Seat_sectionRepo {
    private readonly _seat_sectionModel: Model<Seat_sectionDocument>
    constructor(@InjectModel(Seat_section.name) seat_sectionModel: Model<Seat_sectionDocument>){
        this._seat_sectionModel = seat_sectionModel;
    }
    
    async createSeat_section(data: any): Promise<Seat_sectionDocument> {
        return await this._seat_sectionModel.create(data);
    }

    async createManySeat_section(data: any): Promise<any> {
        return await this._seat_sectionModel.insertMany(data);
    }

    async findSeat_sectionById(id: any): Promise<Seat_sectionDocument> {
        return await this._seat_sectionModel.findById(id);
    }

    async findOneSeat_sectionByCondition(condition: any): Promise<Seat_sectionDocument> {
        return await this._seat_sectionModel.findOne(condition);
    }

    async findSeat_sectionByCondition(condition: any): Promise<any> {
        return await this._seat_sectionModel.find(condition);
    }

    async updateSeat_section(id: any, data: any): Promise<Seat_sectionDocument> {
        return await this._seat_sectionModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteSeat_section(id: any){
        return await this._seat_sectionModel.findByIdAndDelete(id);
    }

    async getSeatForMember(eventId, seatId, codeSeat, price){
        return await this._seat_sectionModel.findOne(
            {
                event_id: StringUtils.ObjectId(eventId),
                seat_id: StringUtils.ObjectId(seatId),
                'data_seat.id': codeSeat,
                price: price
            }
        )
    }

    async getSeatSectionByCondition(condition: GetSeatSectionByCondition){
        
        const query: any = {};
        if (condition.query) {
            const regex = new RegExp(condition.query, 'i');
            query.$or = [
                { name: { $regex: regex } }
            ];
        }
        if (condition.time_from && condition.time_to) {
            query['createdAt'] = {
                $gte: new Date(condition.time_from),
                $lte: new Date(condition.time_to)
            };
        }

        if (condition.eventId){
            query.event_id = StringUtils.ObjectId(condition.eventId);
        }

        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = (condition.page ? (condition.page - 1) * limit : 0);

        const seatSection = await this._seat_sectionModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'events',
                    localField: 'event_id',
                    foreignField: '_id',
                    as: 'InfoEvents'
                }
            },
            { $sort: sort },
            { $skip: skip }, 
            { $limit: limit },
        ]);

        const total = await this._seat_sectionModel.countDocuments(query);
    
        return {
            seatSection,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }
    
    async updateSeat_sectionById(id: any, data: any): Promise<Seat_sectionDocument> {
        return await this._seat_sectionModel.findByIdAndUpdate(id, data);
    }
    async deleteSeat_sectionByEvents(eventId): Promise<any>{
        return await this._seat_sectionModel.deleteMany({event_id: StringUtils.ObjectId(eventId)});
    }
}

