import { StringUtils } from 'src/common/utils/string.utils';

import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Showtimes, ShowtimesDocument } from "src/showtimes/schema/showtimes.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class ShowtimesRepo {
    private readonly _showtimesModel: Model<ShowtimesDocument>
    constructor(@InjectModel(Showtimes.name) showtimesModel: Model<ShowtimesDocument>){
        this._showtimesModel = showtimesModel;
    }
    
    async createShowtimes(data: any): Promise<ShowtimesDocument> {
        return await this._showtimesModel.create(data);
    }

    async createManyShowtimes (data: any): Promise<any> {
        return await this._showtimesModel.insertMany(data)
    }

    async findShowtimesById(id: any): Promise<ShowtimesDocument> {
        return await this._showtimesModel.findById(id);
    }

    async findShowtimesByCondition(condition: any): Promise<ShowtimesDocument> {
        return await this._showtimesModel.findOne(condition);
    }

    async updateShowtimes(id: any, data: any): Promise<ShowtimesDocument> {
        return await this._showtimesModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteShowtimes(id: any){
        return await this._showtimesModel.findByIdAndDelete(id);
    }

    async deleteShowtimesByEvent(idEvent: any): Promise<any>{
        return await this._showtimesModel.deleteMany({event_id: StringUtils.ObjectId(idEvent)});
    }

}

