
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Orders, OrdersDocument } from "src/orders/schema/orders.schema";
import { InjectModel } from "@nestjs/mongoose";
import { StringUtils } from "src/common/utils/string.utils";
import { GetOrderByCondition } from "./dto/condition.dto";
import { OrderStatus } from "./enum/status.enum";
import { GetRevenueReportDto } from "src/analytics/dto/getRevenueReport.dto";
import { TypeQuery } from "src/analytics/enum/type.dto";


@Injectable()
export class OrdersRepo {
    private readonly _ordersModel: Model<OrdersDocument>
    constructor(@InjectModel(Orders.name) ordersModel: Model<OrdersDocument>) {
        this._ordersModel = ordersModel;
    }

    async createOrders(data: any): Promise<OrdersDocument> {
        return await this._ordersModel.create(data);
    }

    async findOrdersById(id: any): Promise<OrdersDocument> {
        return await this._ordersModel.findById(id);
    }

    async getOrderInfo(id): Promise<any> {
        return await this._ordersModel.aggregate([
            {
                $match: {
                    _id: StringUtils.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'order_details',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderItems'
                }
            },
            {
                $lookup: {
                    from: 'showtimes',
                    localField: 'event_id',
                    foreignField: 'event_id',
                    as: 'InfoShowTimes'
                }
            },
            {
                $lookup: {
                    from: 'order_seats',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderSeats'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: '_id',
                    as: 'InfoUser'
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderPayment'
                }
            },
            { $unwind: { path: '$InfoOrderPayment', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$InfoUser', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    'InfoUser.idWebSocket': 0,
                    'InfoUser.password': 0,
                }
            }
        ]).exec();
    }

    async getOrderByCondition(condition: GetOrderByCondition, uid?: any) {

        const query: any = {};
        const paymentStatus: any = {};
        if (condition.query) {
            try {
                // Nếu condition.query là một chuỗi ID hợp lệ, sử dụng nó để tìm theo employee_id
                const validObjectId = StringUtils.ObjectId(condition.query);
                query.$or = [
                    { code: { $regex: new RegExp(condition.query, 'i') } },
                    { referred_by: { $regex: new RegExp(condition.query, 'i') } },
                    { employee_id: validObjectId }  // Thêm điều kiện để tìm theo employee_id
                ];
            } catch (error) {
                // Nếu không phải ObjectId hợp lệ, chỉ tìm theo code và referred_by
                const regex = new RegExp(condition.query, 'i');
                query.$or = [
                    { code: { $regex: regex } },
                    { referred_by: { $regex: regex } }
                ];
            }
        }
        if (condition.time_from && condition.time_to) {
            query['createdAt'] = {
                $gte: new Date(condition.time_from),
                $lte: new Date(condition.time_to)
            };
        }

        if (condition.status) {
            paymentStatus['InfoOrderPayment.status'] = condition.status;
        }

        if (uid) {
            query.uid = uid;
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

        const orders = await this._ordersModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'order_details',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderItems'
                }
            },
            {
                $lookup: {
                    from: 'order_seats',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderSeats'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'uid',
                    foreignField: '_id',
                    as: 'InfoUser'
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderPayment'
                }
            },
            { $unwind: { path: '$InfoOrderPayment', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$InfoUser', preserveNullAndEmptyArrays: true } },
            // Lookup từ collection "events" để lấy thông tin event, bao gồm title
            {
                $lookup: {
                    from: "events",
                    localField: "event_id",      // trường event_id trong order
                    foreignField: "_id",         // trường _id của document event (có thể thay đổi nếu cần)
                    as: "eventDetail"
                }
            },
            {
                $unwind: {
                    path: "$eventDetail",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Lookup từ collection "content_events" để lấy thông tin, ví dụ time
            {
                $lookup: {
                    from: "content_events",
                    localField: "event_id",      // trường event_id trong order
                    foreignField: "event_id",    // trường trong content_events để join
                    as: "contentEvent"
                }
            },
            {
                $unwind: {
                    path: "$contentEvent",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'InfoUser.idWebSocket': 0,
                    'InfoUser.password': 0,
                }
            },
            {
                $match: paymentStatus
            },
            {
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    InfoOrderItems: { $first: "$InfoOrderItems" },
                    InfoOrderSeats: { $first: "$InfoOrderSeats" },
                    InfoUser: { $first: "$InfoUser" },
                    InfoOrderPayment: { $first: "$InfoOrderPayment" },
                    eventDetail: { $first: "$eventDetail" },
                    contentEvent: { $first: "$contentEvent" }
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: ["$doc", { 
                    InfoOrderItems: "$InfoOrderItems", 
                    InfoOrderSeats: "$InfoOrderSeats",
                    InfoUser: "$InfoUser",
                    InfoOrderPayment: "$InfoOrderPayment",
                    eventDetail: "$eventDetail",
                    contentEvent: "$contentEvent"
                }] } }
            },
            {
                $sort: sort,
            },
            {
                $skip: skip
            },
            {
                $limit: Number(condition.limit)
            },
        ])

        const total = await this._ordersModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoOrderPayment'
                }
            },
            { $unwind: { path: '$InfoOrderPayment', preserveNullAndEmptyArrays: true } },
            {
                $match: paymentStatus
            }
        ])
        const count = total.length

        return {
            orders,
            total: count,
            totalPages: Math.ceil(count / condition.limit),
            currentPage: condition.page,
        };
    }

    async findOneOrdersByCondition(condition: any): Promise<OrdersDocument> {
        return await this._ordersModel.findOne(condition);
    }

    async findOrdersByCondition(condition: any): Promise<any> {
        return await this._ordersModel.find(condition);
    }

    async getOrderSeats(eventId, showtimeId){
        return await this._ordersModel.aggregate([
            {
                $match: {
                    event_id: StringUtils.ObjectId(eventId),
                    showtimes_id: StringUtils.ObjectId(showtimeId)
                }
            },
            {
                $lookup: {
                    from: 'order_seats',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoSeat'
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoPayment'
                }
            },
            {
                $unwind: '$InfoPayment'
            }
        ]);
    }

    async updateOrders(id: any, data: any): Promise<OrdersDocument> {
        return await this._ordersModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteOrders(id: any) {
        return await this._ordersModel.findByIdAndDelete(id);
    }

    async findSeatBooking(eventID: string) {
        return await this._ordersModel.aggregate([
            {
                $match: {
                    event_id: StringUtils.ObjectId(eventID)
                }
            },
            {
                $lookup: {
                    from: 'order_details',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'InfoSeats'
                }
            }
        ])
    }

    async getOrderRevenueByPeriod(start: Date, end: Date): Promise<number> {
        // Tạo điều kiện match: chỉ lấy các order có status = 'PAID'
        const matchCondition: any = { status: 'PAID' };
        
        // Nếu có khoảng thời gian, thêm điều kiện cho trường createdAt
        if (start && end) {
          matchCondition.createdAt = { $gte: start, $lte: end };
        }
        
        // Xây dựng pipeline aggregation: 
        // 1. Lọc theo điều kiện (match)  
        // 2. Nhóm các đơn hàng và tính tổng trường total_price
        const pipeline = [
          { $match: matchCondition },
          { 
            $group: { 
              _id: null, 
              total: { $sum: '$total_price' } 
            } 
          }
        ];

        console.log('getMembershipRevenueByPeriod', pipeline)
        
        const revenueResult = await this._ordersModel.aggregate(pipeline);
        return revenueResult.length > 0 ? revenueResult[0].total : 0;
      }

      async getOrderListForAnalytics(start: Date, end: Date): Promise<any[]> {
        const query: any = {};
        if (start && end) {
          query.createdAt = { $gte: start, $lte: end };
        }

        // query.status = OrderStatus.PAID

        return await this._ordersModel.find(query, { _id: 1, createdAt: 1, total_price: 1 }).exec();
      }

}

