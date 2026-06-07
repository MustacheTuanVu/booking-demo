
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Membership_prices, Membership_pricesDocument } from "src/membership_prices/schema/membership_prices.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class Membership_pricesRepo {
    private readonly _membership_pricesModel: Model<Membership_pricesDocument>
    constructor(@InjectModel(Membership_prices.name) membership_pricesModel: Model<Membership_pricesDocument>){
        this._membership_pricesModel = membership_pricesModel;
    }
    
    async getMembership_prices(condition: any): Promise<any> {
        return await this._membership_pricesModel.find(condition);
    }

    async createMembership_prices(data: any): Promise<Membership_pricesDocument> {
        return await this._membership_pricesModel.create(data);
    }

    async createManyMembership_prices(data: any): Promise<any>{
        return await this._membership_pricesModel.insertMany(data);
    }

    async findMembership_pricesById(id: any): Promise<Membership_pricesDocument> {
        return await this._membership_pricesModel.findById(id);
    }

    async findOneMembership_pricesByCondition(condition: any): Promise<Membership_pricesDocument> {
        return await this._membership_pricesModel.findOne(condition);
    }

    async findMembership_pricesByCondition(condition: any): Promise<any> {
        return await this._membership_pricesModel.find(condition);
    }

    async updateMembership_prices(id: any, data: any): Promise<Membership_pricesDocument> {
        return await this._membership_pricesModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteMembership_prices(id: any){
        return await this._membership_pricesModel.findByIdAndDelete(id);
    }

}

