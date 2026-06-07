
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Bank, BankDocument } from "src/bank/schema/bank.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class BankRepo {
    private readonly _bankModel: Model<BankDocument>
    constructor(@InjectModel(Bank.name) bankModel: Model<BankDocument>){
        this._bankModel = bankModel;
    }
    
    async createBank(data: any): Promise<BankDocument> {
        return await this._bankModel.create(data);
    }

    async createManyBank(data: any): Promise<any>{
        return await this._bankModel.insertMany(data);
    }

    async findBankById(id: any): Promise<BankDocument> {
        return await this._bankModel.findById(id);
    }

    async findOneBankByCondition(condition: any): Promise<BankDocument> {
        return await this._bankModel.findOne(condition);
    }

    async findBankByCondition(condition: any): Promise<any> {
        return await this._bankModel.find(condition);
    }

    async updateBank(id: any, data: any): Promise<BankDocument> {
        return await this._bankModel.findByIdAndUpdate(id, data, { new: true });
    }

    async updateBankByCondition(condition, data){
        return await this._bankModel.findOneAndUpdate(condition, data, {new: true});
    }

    async deleteBank(id: any){
        return await this._bankModel.findByIdAndDelete(id);
    }

}

