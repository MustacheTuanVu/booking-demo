import { StringUtils } from 'src/common/utils/string.utils';

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from 'src/promotion/schema/promotion.schema';
import { InjectModel } from '@nestjs/mongoose';
import { GetPromotionByCondition } from './dto/condition.dto';
import { GetPromotionByAdmin } from './dto/condition.admin.dto';

@Injectable()
export class PromotionRepo {
    private readonly _promotionModel: Model<PromotionDocument>;
    constructor(@InjectModel(Promotion.name) promotionModel: Model<PromotionDocument>) {
        this._promotionModel = promotionModel;
    }

    async createPromotion(data: any): Promise<PromotionDocument> {
        return await this._promotionModel.create(data);
    }

    async findPromotionById(id: any): Promise<PromotionDocument> {
        return await this._promotionModel.findById(id);
    }    
    
    async findOnePromotionByCondition(condition: any): Promise<any> {
        return await this._promotionModel.findOne(condition);
    }

    async updatePromotion(id: any, data: any): Promise<PromotionDocument> {
        return await this._promotionModel.findByIdAndUpdate(id, data, { new: true });
    }

    async effectPromotion(id, type) {
        const updateValue = type === 'ADD' ? 1 : -1;
        
        if (type === 'ADD') {
            const promotion = await this._promotionModel.findById(id);
            if (promotion && promotion.max_quantity >= promotion.total) {
                return null;
            }
        }
        
        return await this._promotionModel.updateOne(
            { _id: StringUtils.ObjectId(id) },
            { $inc: { max_quantity: updateValue } },
        );
    }

    async deletePromotion(id: any) {
        return await this._promotionModel.findByIdAndDelete(id);
    }

    async getPromotionByAdmin(
        condition: GetPromotionByAdmin,
    ) {
        const query: any = {};

        if (condition.query) {
            const regex = new RegExp(condition.query, 'i');
            query.$or = [{ name: { $regex: regex } }, { code: { $regex: regex } }];
        }
        if (condition.time_from && condition.time_to) {
            query['expired'] = {
                $gte: new Date(condition.time_from),
                $lte: new Date(condition.time_to),
            };
        }

         // lấy những cái còn hạn
         if (typeof condition.expired !== "undefined" && Number(condition.expired) === 0) {
            query.expired = { $gte: new Date() };
        }else if (typeof condition.expired !== "undefined" && Number(condition.expired) === 1) {
            query.expired = { $lt: new Date() };
        }

        if (condition.for) {
            query.for = condition.for;
        }

        if (condition.status) {
            query.status = condition.status;
        }

        if (typeof condition.haveUser !== "undefined" && Number(condition.haveUser) === 0) {
            query.$or = query.$or || []; // Nếu chưa có $or, tạo array rỗng
            query.$or.push({ uid: { $exists: false } }, { uid: null });
        }else if(typeof condition.haveUser !== "undefined" && Number(condition.haveUser) === 1){
            query.$or = query.$or || []; // Nếu chưa có $or, tạo array rỗng
            query.$or.push({ uid: { $exists: true } });
        }

        if (typeof condition.exits !== "undefined" && Number(condition.exits) === 1) {
            query.max_quantity = { $gt: 0 };
        } else if (typeof condition.exits !== "undefined" && Number(condition.exits) === 0){
            query.max_quantity = { $lte: 0 };
        }

        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = condition.page ? (condition.page - 1) * limit : 0;

        console.log(query);
        let promotion: any;
        promotion = await this._promotionModel.find(query).sort(sort).skip(skip).limit(limit);

        const total = await this._promotionModel.countDocuments(query);
        return {
            promotion,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async getPromotionByCondition(condition: GetPromotionByCondition, uid?: any, haveUser?: boolean) {
        const query: any = {};
        if (condition.query) {
            const regex = new RegExp(condition.query, 'i');
            query.$or = [{ name: { $regex: regex } }, { code: { $regex: regex } }];
        }

        if (condition.time_from && condition.time_to) {
            query['expired'] = {
                $gte: new Date(condition.time_from),
                $lte: new Date(condition.time_to),
            };
        }

        if (typeof haveUser !== "undefined" && !haveUser) {
            query.$or = query.$or || []; 
            query.$or.push({ uid: { $exists: false } }, { uid: null });
        }else if(typeof haveUser !== "undefined" && haveUser){
            query.$or = query.$or || [];
            query.$or.push({ uid: { $exists: true } });
        }

        // lấy những cái còn hạn
        if (typeof condition.expired !== "undefined" && Number(condition.expired) === 0) {
            query.expired = { $gte: new Date() };
        }else if (typeof condition.expired !== "undefined" && Number(condition.expired) === 1) {
            query.expired = { $lt: new Date() };
        }

        query.max_quantity = { $gt: 0 };

        if (condition.for) {
            query.for = condition.for;
        }

        if (condition.status) {
            query.status = condition.status;
        }

        if (uid) {
            query.uid = uid;
        } else {
            query.$or = [{ uid: { $exists: false } }, { uid: null }];
        }


        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = condition.page ? (condition.page - 1) * limit : 0;

        console.log(query);
        let promotion: any;
        if (uid) {
            promotion = await this._promotionModel.find(query).sort(sort).skip(skip).limit(limit);
        } else {
            promotion = await this._promotionModel
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);
        }

        const total = await this._promotionModel.countDocuments(query);
        return {
            promotion,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async getPromotionsByPurchasedBy(userId: any, condition: GetPromotionByCondition) {
        const query: any = {
            purchased_by: userId
        };
        
        // Thêm các điều kiện tìm kiếm từ condition
        if (condition.query) {
            const regex = new RegExp(condition.query, 'i');
            query.$or = [{ name: { $regex: regex } }, { code: { $regex: regex } }];
        }
    
        if (condition.time_from && condition.time_to) {
            query['expired'] = {
                $gte: new Date(condition.time_from),
                $lte: new Date(condition.time_to),
            };
        }
    
        // Lấy những cái còn hạn
        if (typeof condition.expired !== "undefined" && Number(condition.expired) === 0) {
            query.expired = { $gte: new Date() };
        } else if (typeof condition.expired !== "undefined" && Number(condition.expired) === 1) {
            query.expired = { $lt: new Date() };
        }
    
        if (condition.for) {
            query.for = condition.for;
        }
    
        if (condition.status) {
            query.status = condition.status;
        }
    
        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }
    
        const limit = condition.limit || 10;
        const skip = condition.page ? (condition.page - 1) * limit : 0;
    
        console.log('Getting promotions with query:', query);
        
        const promotion = await this._promotionModel.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await this._promotionModel.countDocuments(query);
        
        return {
            promotion,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }
}
