
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Media, MediaDocument } from "src/media/schema/media.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class MediaRepo {
    private readonly _mediaModel: Model<MediaDocument>
    constructor(@InjectModel(Media.name) mediaModel: Model<MediaDocument>){
        this._mediaModel = mediaModel;
    }
    
    async createMedia(data: any): Promise<MediaDocument> {
        return await this._mediaModel.create(data);
    }

    async findMediaById(id: any): Promise<MediaDocument> {
        return await this._mediaModel.findById(id);
    }

    async findOneMediaByCondition(condition: any): Promise<MediaDocument> {
        return await this._mediaModel.findOne(condition);
    }

    async findMediaByCondition(condition: any): Promise<any> {
        return await this._mediaModel.find(condition);
    }

    async updateMedia(id: any, data: any): Promise<MediaDocument> {
        return await this._mediaModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteMedia(id: any){
        return await this._mediaModel.findByIdAndDelete(id);
    }
    
    async deleteMultiCondition(id_relative): Promise<any>{
        return await this._mediaModel.deleteMany({relative_id: id_relative});
    }


    async createMultiMedia(data: any){
        return await this._mediaModel.insertMany(data);
    }


}

