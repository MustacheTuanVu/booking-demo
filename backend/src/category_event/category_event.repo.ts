
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { InjectModel } from "@nestjs/mongoose";
import { Category_event, Category_eventDocument } from "./schema/category.schema";
import { GetCategoryByCondition } from "./dto/condition.dto";


@Injectable()
export class Category_eventRepo {
    private readonly _category_eventModel: Model<Category_eventDocument>
    constructor(@InjectModel(Category_event.name) category_eventModel: Model<Category_eventDocument>){
        this._category_eventModel = category_eventModel;
    }
    
    async createCategory_event(data: any): Promise<Category_eventDocument> {
        return await this._category_eventModel.create(data);
    }

    async getCategoryByCondition(condition: GetCategoryByCondition): Promise<any> {
        const query: any = {};
    
        if (condition.status) {
            query['status'] = condition.status;
        }
    
        if (condition.query) {
            const regex = new RegExp(condition.query, 'i');
            query.$or = [
                { name: { $regex: regex } },
                { slug: { $regex: regex } },
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
    
        const category = await this._category_eventModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await this._category_eventModel.countDocuments(query);

        return {
            category,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }
    
    async findCategory_eventById(id: any): Promise<Category_eventDocument> {
        return await this._category_eventModel.findById(id);
    }

    async findCategory_eventByCondition(condition: any): Promise<Category_eventDocument> {
        return await this._category_eventModel.findOne(condition);
    }

    async updateCategory_event(id: any, data: any): Promise<Category_eventDocument> {
        return await this._category_eventModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategory_event(id: any){
        return await this._category_eventModel.findByIdAndDelete(id);
    }

}

