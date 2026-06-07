
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Seat_map, Seat_mapDocument } from "src/seat_map/schema/seat_map.schema";
import { InjectModel } from "@nestjs/mongoose";
import { GetSeatMapByCondition } from "./dto/condition.dto";


@Injectable()
export class Seat_mapRepo {
    private readonly _seat_mapModel: Model<Seat_mapDocument>
    constructor(@InjectModel(Seat_map.name) seat_mapModel: Model<Seat_mapDocument>){
        this._seat_mapModel = seat_mapModel;
    }
    
    async createSeat_map(data: any): Promise<Seat_mapDocument> {
        return await this._seat_mapModel.create(data);
    }

    async getSeatMapByCondition(condition: GetSeatMapByCondition){
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

        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = (condition.page ? (condition.page - 1) * limit : 0);

        const category = await this._seat_mapModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await this._seat_mapModel.countDocuments(query);

        return {
            category,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async findSeat_mapById(id: any): Promise<Seat_mapDocument> {
        return await this._seat_mapModel.findById(id);
    }

    async findSeat_mapByCondition(condition: any): Promise<Seat_mapDocument> {
        return await this._seat_mapModel.findOne(condition);
    }

    async updateSeat_map(id: any, data: any): Promise<Seat_mapDocument> {
        return await this._seat_mapModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteSeat_map(id: any){
        return await this._seat_mapModel.findByIdAndDelete(id);
    }

}

