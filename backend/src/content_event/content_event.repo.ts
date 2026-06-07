
import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { Content_event, Content_eventDocument } from "src/content_event/schema/content_event.schema";
import { InjectModel } from "@nestjs/mongoose";
import { StringUtils } from "src/common/utils/string.utils";


@Injectable()
export class Content_eventRepo {
    private readonly _content_eventModel: Model<Content_eventDocument>
    constructor(@InjectModel(Content_event.name) content_eventModel: Model<Content_eventDocument>){
        this._content_eventModel = content_eventModel;
    }
    
    async createContent_event(data: any): Promise<Content_eventDocument> {
        return await this._content_eventModel.create(data);
    }

    async createManyContent_event(data: any): Promise<any>{
        return await this._content_eventModel.insertMany(data);
    }

    async findContent_eventById(id: any): Promise<Content_eventDocument> {
        return await this._content_eventModel.findById(id);
    }

    async findContent_eventByCondition(condition: any): Promise<Content_eventDocument> {
        return await this._content_eventModel.findOne(condition);
    }

    async updateContent_event(id: any, data: any): Promise<Content_eventDocument> {
        return await this._content_eventModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteContent_event(id: any){
        return await this._content_eventModel.findByIdAndDelete(id);
    }

    async findByArtistId(artistId: any){
        return await this._content_eventModel.aggregate([
            {
              $match: artistId,
            },
            {
              $lookup: {
                from: 'events',            // tên collection events trong MongoDB
                localField: 'event_id',    // trường trong content_event
                foreignField: '_id',       // trường trong events
                as: 'eventData',
              },
            },
            { $unwind: '$eventData' },
            {
              $project: {
                _id: 1,
                event_id: 1,
                artist_id: 1,
                time: 1,
                slug: '$eventData.slug',  // lấy slug từ eventData
              },
            },
          ]);
    }

    async deleteContent_eventByEvents(idEvent): Promise<any>{
      return await this._content_eventModel.deleteMany({event_id: StringUtils.ObjectId(idEvent)})
    }

    async findByEventId(eventId: string) {
      return await this._content_eventModel.find({ 
          event_id: StringUtils.ObjectId(eventId) 
      }).exec();
  }

}

