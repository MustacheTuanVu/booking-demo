
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Menu_item, Menu_itemDocument } from "src/menu_item/schema/menu_item.schema";
import { InjectModel } from "@nestjs/mongoose";
import { GetMenuItemByCondition } from "./dto/condition.dto";
import { StringUtils } from "src/common/utils/string.utils";


@Injectable()
export class Menu_itemRepo {
    private readonly _menu_itemModel: Model<Menu_itemDocument>
    constructor(@InjectModel(Menu_item.name) menu_itemModel: Model<Menu_itemDocument>){
        this._menu_itemModel = menu_itemModel;
    }
    
    async createMenu_item(data: any): Promise<Menu_itemDocument> {
        return await this._menu_itemModel.create(data);
    }

    async findMenu_itemById(id: any): Promise<Menu_itemDocument> {
        return await this._menu_itemModel.findById(id).populate('category_id');
    }

    async getMenuItemByCondition(condition: GetMenuItemByCondition){
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
        
        if(condition.status){
            query.status = condition.status;
        }

        if(condition.category_id){
            query.category_id = StringUtils.ObjectId(condition.category_id)
        }

        if(condition.type){
            query.type = condition.type;
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

        const menuItem = await this._menu_itemModel
            .find(query).populate('category_id')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await this._menu_itemModel.countDocuments(query);

        return {
            menuItem,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async findOneMenu_itemByCondition(condition: any): Promise<Menu_itemDocument> {
        return await this._menu_itemModel.findOne(condition);
    }

    async findMenu_itemByCondition(condition: any): Promise<any> {
        return await this._menu_itemModel.find(condition);
    }

    async updateMenu_item(id: any, data: any): Promise<Menu_itemDocument> {
        return await this._menu_itemModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteMenu_item(id: any){
        return await this._menu_itemModel.findByIdAndDelete(id);
    }

    async updateByCukCukId(cukcukId, data){
        return await this._menu_itemModel.updateOne({item_id_cukcuk: cukcukId}, data)
    }

    async getNewVersion() {
        return await this._menu_itemModel.findOne().sort({ '--v': -1 });
    }

    async deleteOldVersion(oldVer: number): Promise<any> {
        const filter = { __v: { $lte: oldVer } };

        const itemsToDelete = await this._menu_itemModel.find(filter);
        await this._menu_itemModel.deleteMany(filter);

        return itemsToDelete;
    }
}

