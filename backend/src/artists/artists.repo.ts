
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Artists, ArtistsDocument } from "src/artists/schema/artists.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class ArtistsRepo {
    private readonly _artistsModel: Model<ArtistsDocument>
    constructor(@InjectModel(Artists.name) artistsModel: Model<ArtistsDocument>){
        this._artistsModel = artistsModel;
    }
    
    async createArtists(data: any): Promise<ArtistsDocument> {
        return await this._artistsModel.create(data);
    }

    async findArtistsById(id: any): Promise<ArtistsDocument> {
        return await this._artistsModel.findById(id);
    }

    async getArtistsByCondition(condition){

        const query: any = {};
        if (condition.query) {
            const regex = new RegExp(condition.query, 'i');
            query.$or = [
                { name: { $regex: regex } },
                { link: { $regex: regex } }
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


        const artists = await this._artistsModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await this._artistsModel.countDocuments(query);

        return {
            artists,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async findArtistsByCondition(condition: any): Promise<ArtistsDocument> {
        return await this._artistsModel.findOne(condition);
    }

    async updateArtists(id: any, data: any): Promise<ArtistsDocument> {
        return await this._artistsModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteArtists(id: any){
        return await this._artistsModel.findByIdAndDelete(id);
    }

    async findArtistsBySlug(slug: any): Promise<ArtistsDocument> {
        return await this._artistsModel.findOne({link: slug});
    }

}

