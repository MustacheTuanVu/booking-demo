
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Order_seat, Order_seatDocument } from "src/order_seat/schema/order_seat.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class Order_seatRepo {
    private readonly _order_seatModel: Model<Order_seatDocument>
    constructor(@InjectModel(Order_seat.name) order_seatModel: Model<Order_seatDocument>){
        this._order_seatModel = order_seatModel;
    }
    
    async createOrder_seat(data: any): Promise<Order_seatDocument> {
        return await this._order_seatModel.create(data);
    }

    async createManyOrder_seat(data: any): Promise<any> {
        return await this._order_seatModel.insertMany(data);
    }

    async findOrder_seatById(id: any): Promise<Order_seatDocument> {
        return await this._order_seatModel.findById(id);
    }

    async findOneOrder_seatByCondition(condition: any): Promise<Order_seatDocument> {
        return await this._order_seatModel.findOne(condition);
    }

    async findOrder_seatByCondition(condition: any): Promise<any> {
        return await this._order_seatModel.find(condition);
    }

    async updateOrder_seat(id: any, data: any): Promise<Order_seatDocument> {
        return await this._order_seatModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteOrder_seat(id: any){
        return await this._order_seatModel.findByIdAndDelete(id);
    }

    async deleteOrderSeats(condition): Promise<any>{
        return await this._order_seatModel.deleteMany(condition)
    }

}

