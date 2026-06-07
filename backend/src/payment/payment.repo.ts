
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Payment, PaymentDocument } from "src/payment/schema/payment.schema";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class PaymentRepo {
    private readonly _paymentModel: Model<PaymentDocument>
    constructor(@InjectModel(Payment.name) paymentModel: Model<PaymentDocument>){
        this._paymentModel = paymentModel;
    }
    
    async createPayment(data: any): Promise<PaymentDocument> {
        return await this._paymentModel.create(data);
    }

    async createManyPayment(data: any): Promise<any>{
        return await this._paymentModel.insertMany(data);
    }

    async findPaymentById(id: any): Promise<PaymentDocument> {
        return await this._paymentModel.findById(id);
    }

    async findOnePaymentByCondition(condition: any): Promise<PaymentDocument> {
        return await this._paymentModel.findOne(condition);
    }

    async findPaymentByCondition(condition: any): Promise<any> {
        return await this._paymentModel.find(condition);
    }

    async updatePayment(id: any, data: any): Promise<PaymentDocument> {
        return await this._paymentModel.findByIdAndUpdate(id, data, { new: true });
    }

    async findOneUpdate(condition, data: any){
        return await this._paymentModel.findOneAndUpdate(condition, data, {new: true});
    }

    async deletePayment(id: any){
        return await this._paymentModel.findByIdAndDelete(id);
    }

    async deletePaymentByCondition(condition): Promise<any>{
        return await this._paymentModel.deleteMany(condition);
    }
}

