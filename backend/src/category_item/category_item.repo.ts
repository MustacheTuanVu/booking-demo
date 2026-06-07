
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Category_item, Category_itemDocument } from "src/category_item/schema/category_item.schema";
import { InjectModel } from "@nestjs/mongoose";
import { GetCategoryByCondition } from "./dto/condition.dto";


@Injectable()
export class Category_itemRepo {
    private readonly _category_itemModel: Model<Category_itemDocument>
    constructor(@InjectModel(Category_item.name) category_itemModel: Model<Category_itemDocument>) {
        this._category_itemModel = category_itemModel;
    }

    async createCategory_item(data: any): Promise<Category_itemDocument> {
        return await this._category_itemModel.create(data);
    }

    async findCategory_itemById(id: any): Promise<Category_itemDocument> {
        return await this._category_itemModel.findById(id);
    }

    async getCategoryByCondition(condition: GetCategoryByCondition): Promise<any> {
        const query: any = {};

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

        const category = await this._category_itemModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await this._category_itemModel.countDocuments(query);

        return {
            category,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async findOneCategory_itemByCondition(condition: any): Promise<Category_itemDocument> {
        return await this._category_itemModel.findOne(condition);
    }

    async updateCategory_item(id: any, data: any): Promise<Category_itemDocument> {
        return await this._category_itemModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategory_item(id: any) {
        return await this._category_itemModel.findByIdAndDelete(id);
    }

    async getNewVersion() {
        return await this._category_itemModel.findOne().sort({ '--v': -1 });
    }

    async deleteOldVersion(oldVer: number): Promise<any> {
        const filter = { __v: { $lte: oldVer } };

        const itemsToDelete = await this._category_itemModel.find(filter);
        await this._category_itemModel.deleteMany(filter);

        return itemsToDelete;
    }

}

