
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Combo_event, Combo_eventDocument } from "src/combo_event/schema/combo_event.schema";
import { InjectModel } from "@nestjs/mongoose";
import { GetComboEventByCondition } from "./dto/condition.dto";
import { Status } from "src/common/enum/status.enum";
import { StringUtils } from "src/common/utils/string.utils";


@Injectable()
export class Combo_eventRepo {
    private readonly _combo_eventModel: Model<Combo_eventDocument>
    constructor(@InjectModel(Combo_event.name) combo_eventModel: Model<Combo_eventDocument>){
        this._combo_eventModel = combo_eventModel;
    }

    async getComboEventByCondition(condition: GetComboEventByCondition){
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

        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        }else{
            sort.createdAt = -1;
        }

        const limit = condition.limit || 10;
        const skip = (condition.page ? (condition.page - 1) * limit : 0);

        const combo = await this._combo_eventModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'menu_orders',
                    localField: 'menu_id',
                    foreignField: '_id',
                    as: 'MenuOrder'
                }
            },
            {
                $unwind: '$MenuOrder'
            },
            {
                $lookup: {
                    from: 'menu_items',
                    localField: 'MenuOrder.items',
                    foreignField: '_id',
                    as: 'MenuOrder.items'
                }
            }
        ]).sort(sort).skip(skip).limit(limit);

        const total = await this._combo_eventModel.countDocuments(query);

        return {
            combo,
            total: total,
            totalPages: Math.ceil(total / condition.limit),
            currentPage: condition.page,
        };
    }

    async getDetailComboEvent(id){
        return await this._combo_eventModel.aggregate([
            {
                $match: {
                    _id: StringUtils.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'menu_orders',
                    localField: 'menu_id',
                    foreignField: '_id',
                    as: 'MenuOrder'
                }
            },
            {
                $unwind: '$MenuOrder'
            },
            {
                $lookup: {
                    from: 'menu_items',
                    localField: 'MenuOrder.items',
                    foreignField: '_id',
                    as: 'MenuOrder.items'
                }
            }
        ])
    }
    
    async createCombo_event(data: any): Promise<Combo_eventDocument> {
        return await this._combo_eventModel.create(data);
    }

    async createManyCombo_event(data: any): Promise<any>{
        return await this._combo_eventModel.insertMany(data);
    }

    async findCombo_eventById(id: any): Promise<Combo_eventDocument> {
        return await this._combo_eventModel.findById(id);
    }

    async findOneCombo_eventByCondition(condition: any): Promise<Combo_eventDocument> {
        return await this._combo_eventModel.findOne(condition);
    }

    async findCombo_eventByCondition(condition: any): Promise<any> {
        return await this._combo_eventModel.find(condition);
    }

    async updateCombo_event(id: any, data: any): Promise<Combo_eventDocument> {
        return await this._combo_eventModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCombo_event(id: any){
        return await this._combo_eventModel.findByIdAndDelete(id);
    }

    async findComboEventByManyId(ids){
        return await this._combo_eventModel.find({
            _id: { $in: ids },
            status: Status.ACTIVE
        });
    }

    async checkItemInCombo(comboId, itemIds){
        return await this._combo_eventModel.aggregate([
            {
                $match: {
                    _id: StringUtils.ObjectId(comboId)
                }
            },
            {
                $lookup: {
                    from: 'menu_orders',
                    localField: 'menu_id',
                    foreignField: '_id',
                    as: 'InfoMenuOrder'
                }
            },
            {
                $unwind: '$InfoMenuOrder'
            },
            {
                $match: {
                    'InfoMenuOrder.items': {
                        $all: itemIds
                    }
                }
            },
            {
                $lookup: {
                    from: 'menu_items',
                    localField: 'InfoMenuOrder.items',
                    foreignField: '_id',
                    as: 'InfoItem'
                }
            },
            {
                $addFields: {
                    InfoItem: {
                        $filter: {
                            input: '$InfoItem',
                            as: 'item',
                            cond: { $in: ['$$item._id', itemIds] } // Lọc chỉ lấy item có trong itemIds
                        }
                    }
                }
            }
        ])
    }

    async countPrice(comboIds){
        const combos = await this._combo_eventModel.aggregate([
            {
                $match: {
                    _id: { $in: comboIds }
                }
            }
        ]);
    
        const totalPrice = combos.reduce((sum, combo) => sum + (combo.price || 0), 0);
        return totalPrice;

    }
}

