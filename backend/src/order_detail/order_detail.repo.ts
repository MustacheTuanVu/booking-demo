
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Order_detail, Order_detailDocument } from "src/order_detail/schema/order_detail.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class Order_detailRepo {
    private readonly _order_detailModel: Model<Order_detailDocument>
    constructor(@InjectModel(Order_detail.name) order_detailModel: Model<Order_detailDocument>){
        this._order_detailModel = order_detailModel;
    }
    
    async createOrder_detail(data: any): Promise<Order_detailDocument> {
        return await this._order_detailModel.create(data);
    }
    
    async createManyOrder_detail(data: any): Promise<any> {
        return await this._order_detailModel.insertMany(data);
    }

    async findOrder_detailById(id: any): Promise<Order_detailDocument> {
        return await this._order_detailModel.findById(id);
    }

    async findOrder_detailByCondition(condition: any): Promise<Order_detailDocument> {
        return await this._order_detailModel.findOne(condition);
    }

    async updateOrder_detail(id: any, data: any): Promise<Order_detailDocument> {
        return await this._order_detailModel.findByIdAndUpdate(id, data, { new: true });
    }

    async updateOrder_detailByCondition(condition: any, data: any): Promise<Order_detailDocument> {
        return await this._order_detailModel.findOneAndUpdate(condition, data, { new: true });
    }

    async deleteOrder_detail(id: any){
        return await this._order_detailModel.findByIdAndDelete(id);
    }

    async deleteByCondition(condition): Promise<any>{
        return await this._order_detailModel.deleteMany(condition);
    }

}

