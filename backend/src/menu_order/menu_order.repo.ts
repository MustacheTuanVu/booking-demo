
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Menu_order, Menu_orderDocument } from "src/menu_order/schema/menu_order.schema";
import { InjectModel } from "@nestjs/mongoose";
import { GetMenuOrderByCondition } from "./dto/condition.dto";


@Injectable()
export class Menu_orderRepo {
    private readonly _menu_orderModel: Model<Menu_orderDocument>
    constructor(@InjectModel(Menu_order.name) menu_orderModel: Model<Menu_orderDocument>){
        this._menu_orderModel = menu_orderModel;
    }
    
    async createMenu_order(data: any): Promise<Menu_orderDocument> {
        return await this._menu_orderModel.create(data);
    }

    async createManyMenu_order(data: any): Promise<any>{
        return await this._menu_orderModel.insertMany(data);
    }

    async findMenu_orderById(id: any): Promise<Menu_orderDocument> {
        return await this._menu_orderModel.findById(id);
    }

    async findOneMenu_orderByCondition(condition: any): Promise<Menu_orderDocument> {
        return await this._menu_orderModel.findOne(condition);
    }

    async findMenu_orderByCondition(condition: any): Promise<any> {
        return await this._menu_orderModel.find(condition);
    }

    async updateMenu_order(id: any, data: any): Promise<Menu_orderDocument> {
        return await this._menu_orderModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteMenu_order(id: any){
        return await this._menu_orderModel.findByIdAndDelete(id);
    }

    async getMenuOrderByCondition(condition: GetMenuOrderByCondition){
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

        if(condition.type){
            query.type = condition.type;
        }

        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        }else{
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = (condition.page ? (condition.page - 1) * limit : 0);

        const menuOrder = await this._menu_orderModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'menu_items',
                    localField: 'items',
                    foreignField: '_id',
                    as: 'items'
                }
            }
        ]).sort(sort).skip(skip).limit(limit);

        const total = await this._menu_orderModel.countDocuments(query);

        return {
            menuOrder,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }
}

