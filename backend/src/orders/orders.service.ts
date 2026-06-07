import { Order_detailService } from 'src/order_detail/order_detail.service';
import { CreateOrder } from './dto/create.dto';
import { OrdersRepo } from './orders.repo';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Order_seatService } from 'src/order_seat/order_seat.service';
import { StringUtils } from 'src/common/utils/string.utils';
import { UsersService } from 'src/users/users.service';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { PromotionService } from 'src/promotion/promotion.service';
import { MessageCode } from 'src/common/exception/MessageCode';
import { PromotionForType } from 'src/promotion/enum/status.enum';
import { TypePromotion } from 'src/promotion/enum/type.enum';
import { PaymentService } from 'src/payment/payment.service';
import { OrderStatus } from './enum/status.enum';
import { RuntimeStateService } from 'src/runtime-state/runtime-state.service';
import { GatewayWebSocket } from 'src/gateway/gateway.gateway';
import { MsgType } from 'src/gateway/enum/type.enum';
import { Combo_eventService } from 'src/combo_event/combo_event.service';
import { Menu_itemService } from 'src/menu_item/menu_item.service';
import { MailerService } from 'src/mailer/mailer.service';
import { UserModel } from 'src/users/model/user.model';
import { TypeBuy } from 'src/membership_logs/enum/type.enum';
import { Membership_logsService } from 'src/membership_logs/membership_logs.service';
import { SystemService } from 'src/system/system.service';
import e from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class OrdersService implements OnModuleInit {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private readonly _ordersRepo: OrdersRepo,
        private readonly _orderDetailService: Order_detailService,
        @Inject(forwardRef(() => Order_seatService))
        private readonly _orderSeatService: Order_seatService,
        private readonly _userService: UsersService,
        private readonly _promotionService: PromotionService,
        @Inject(forwardRef(() => PaymentService)) private readonly _paymentService: PaymentService,
        private readonly runtimeStateService: RuntimeStateService,
        @Inject(forwardRef(() => GatewayWebSocket))
        private readonly _gatewayWebSocket: GatewayWebSocket,
        private readonly _comboEventService: Combo_eventService,
        private readonly _menuItemService: Menu_itemService,
        private readonly _mailerService: MailerService,
        private readonly _memberLogService: Membership_logsService,
        private readonly _systemService: SystemService
    ) {}

    async onModuleInit() {
        const pendingOrders = await this._ordersRepo.findOrdersByCondition({
            status: OrderStatus.PENDING,
        });

        for (const order of pendingOrders) {
            const createdAt = new Date((order as any).createdAt).getTime();
            const elapsedSeconds = Number.isFinite(createdAt)
                ? Math.floor((Date.now() - createdAt) / 1000)
                : 5 * 60;
            const remainingSeconds = Math.max(1, 5 * 60 - elapsedSeconds);
            await this.schedulePendingOrderExpiration(
                String(order._id),
                order,
                remainingSeconds,
            );
        }
    }

    async createOrder(username: string, createOrder: CreateOrder) {
        const user = await this._userService.findByGoogleId(username);

        const idOrder = StringUtils.generateObjectId();
        const code = RandomCodeUtils.generateUniqueCode(15);

        // prepare the bill
        let price = 0;
        const orderDetail = createOrder.createOrderDetail;
        for (let i = 0; i < orderDetail.combo_info.length; i++) {
            const item = orderDetail.combo_info[i];
            const priceCombos = await this._comboEventService.countPrice([
                StringUtils.ObjectId(item.comboId),
            ]);
            price += priceCombos * item.count;
        }

        const orderUpsell = orderDetail.item_upsell;
        const upSellItem = await this._menuItemService.countPrice(orderUpsell);
        price += upSellItem;

        let data: any = {};

        // promotion check
        if (createOrder.promotion_code) {
            const promotion = await this._promotionService.getPromotionByCode(
                createOrder.promotion_code,
            );
            if (!promotion) {
                throw MessageCode.PROMOTION.PROMOTION_NOT_FOUND;
            }

            // Handle CTV promotions differently
            if (promotion.for_type === PromotionForType.CTV) {
                const usedPromotion = await this._promotionService.usePromotion(
                    createOrder.promotion_code,
                    user._id
                );

                if (usedPromotion) {
                    switch (promotion.type_price) {
                        case TypePromotion.PERCENT:
                            price = price - price * (promotion.price / 100);
                            break;
                        case TypePromotion.VND:
                            price = price - promotion.price;
                            break;
                    }
                    data['promotion'] = {
                        id: promotion._id,
                        code: promotion.code,
                        name: promotion.name,
                        price: promotion.price,
                        type_price: promotion.type_price,
                    };
                }
                await this._promotionService.effectPromotion(String(promotion._id), 'MINUS');
            } else {
                // Handle regular promotions
                if (promotion.max_quantity < 1) {
                    throw MessageCode.PROMOTION.PROMOTION_USED_UP;
                }

                // Check point user for non-CTV promotions
                if (Number(promotion.required_points) > Number(user.point)) {
                    throw MessageCode.POINT.POINTS_NOT_ENOUGH;
                }

                switch (promotion.type_price) {
                    case TypePromotion.PERCENT:
                        price = price - price * (promotion.price / 100);
                        break;
                    case TypePromotion.VND:
                        price = price - promotion.price;
                        break;
                }
                data['promotion'] = {
                    id: promotion._id,
                    code: promotion.code,
                    name: promotion.name,
                    price: promotion.price,
                    type_price: promotion.type_price,
                };

                await this._promotionService.effectPromotion(String(promotion._id), 'MINUS');
            }
        }

        data = {
            ...data,
            _id: idOrder,
            uid: user._id,
            event_id: StringUtils.ObjectId(createOrder.event_id),
            showtimes_id: StringUtils.ObjectId(createOrder.showtimes_id),
            ...(createOrder.employee_id && { employee_id: createOrder.employee_id }),
            code: code,
            total_price: price,
            referred_by: createOrder.referred_by ? createOrder.referred_by : null,
        };

        try {
            const res = await Promise.all([
                this._ordersRepo.createOrders(data),
                this._orderDetailService.createOrderItems(
                    idOrder,
                    user,
                    createOrder.event_id,
                    orderDetail,
                ),
            ]);
            await this.schedulePendingOrderExpiration(idOrder, res);

            this._gatewayWebSocket.sendDataSeat(createOrder.event_id, createOrder.showtimes_id);
            return res;
        } catch (error) {
            if (data.promotion && data.promotion.id) {
                await this.resetVoucher(idOrder);
            }
            await this.deleteOrder(idOrder);
            throw error;
        }
    }

    async testSocketIO(event_id, showtimes_id) {
        this._gatewayWebSocket.sendDataSeat(event_id, showtimes_id);
    }

    async getOrderByCondition(condition, username?: string) {
        if (username) {
            const user = await this._userService.findByGoogleId(username);
            if (!user) {
                throw MessageCode.USER.NOT_FOUND;
            }

            console.log('username', user._id, condition);
            return await this._ordersRepo.getOrderByCondition(condition, user._id);
        }

        if (condition.InfoUser && (condition.InfoUser.phone || condition.InfoUser.name)) {
            // Search for user by phone
            if (condition.InfoUser.phone) {
                const user = await this._userService.findByPhone(condition.InfoUser.phone);
                if (user) {
                    return await this._ordersRepo.getOrderByCondition(condition, user._id);
                }
            }

            // Search by name if phone search didn't return a user
            if (condition.InfoUser.name) {
                // Use findByCondition to search by name
                const users = await this._userService.findByCondition({
                    name: { $regex: new RegExp(condition.InfoUser.name, 'i') },
                });

                if (users && users.length > 0) {
                    // Get orders for the first matching user
                    // You might want to modify this to handle multiple users with the same name
                    return await this._ordersRepo.getOrderByCondition(condition, users[0]._id);
                }
            }
        }

        if (condition.phone || condition.name) {
            // Search for user by phone
            if (condition.phone) {
                const user = await this._userService.findByPhone(condition.phone);
                if (user) {
                    return await this._ordersRepo.getOrderByCondition(condition, user._id);
                }
            }

            // Search by name if phone search didn't return a user
            if (condition.name) {
                // Use findByCondition to search by name
                const users = await this._userService.findByCondition({
                    name: { $regex: new RegExp(condition.name, 'i') },
                });

                if (users && users.length > 0) {
                    // Get orders for the first matching user
                    // You might want to modify this to handle multiple users with the same name
                    return await this._ordersRepo.getOrderByCondition(condition, users[0]._id);
                }
            }
        }

        return await this._ordersRepo.getOrderByCondition(condition);
    }

    async getOrderById(id) {
        return await this._ordersRepo.getOrderInfo(id);
    }

    async findSeatBooking(eventId) {
        const data = await this._ordersRepo.findSeatBooking(eventId);
        const allSeats = data.flatMap((order) => order.InfoSeats);
        const total = allSeats.reduce(
            (sum, item) => ({
                j_size: sum.j_size + (item.j_size || 0),
                q_size: sum.q_size + (item.q_size || 0),
                k_size: sum.k_size + (item.k_size || 0),
            }),
            { j_size: 0, q_size: 0, k_size: 0 },
        );

        return {
            j_size: total.j_size,
            q_size: total.q_size,
            k_size: total.k_size,
        };
    }

    async cancelOrder(orderId: string) {
        const dataRes = await this._paymentService.updatePayment(orderId, {
            status: OrderStatus.CANCELED,
        });
        const dataInternal = await this.runtimeStateService.getUsersInternal();
        if (dataInternal.length > 0) {
            this._gatewayWebSocket.sendData(MsgType.ORDER_CANCELED, dataInternal, dataRes);
        }
        
        // find order by id
        const order = await this._ordersRepo.findOrdersById(orderId);
        if (order?.promotion?.id) {
            await this._promotionService.resetPromotionUsage(order.promotion.id, order.uid)
        }

        console.log('cancel and delete seatOrder, itemOrder');
        await this.deleteDetailInOrder(orderId);
        return dataRes;
    }

    async deleteOrder(orderId: string) {
        console.log('delete');
        const order = await this._ordersRepo.findOrdersById(orderId);
        const tasks = [
            // delete order
            await this._ordersRepo.deleteOrders(orderId),
            // delete order detail
            await this._orderDetailService.deleteOrderDetail(orderId),
            // delete order seats
            // await this._orderSeatService.deleteOrderSeat(orderId),
            // delete payment
            await this._paymentService.deletePaymentByOrder(orderId),
        ];

        if (order?.promotion?.id) {
            // nếu promotion có for_type là CTV thì không effect promotion
            // if (order.promotion.for_type !== PromotionForType.CTV) {
                // effect promotion 
                tasks.push(this._promotionService.effectPromotion(order.promotion.id, 'ADD'));
            // } else {
                // nếu promotion có for_type là CTV thì set used_by trong purchase_history của promotion là {} và set status là 'ACTIVE'
                tasks.push(
                    this._promotionService.resetPromotionUsage(order.promotion.id, order.uid)
                );
            // }
        }
        return await Promise.all(tasks);
    }

    async deleteDetailInOrder(orderId: string) {
        console.log('delete order item, order seat');
        // return when use Promotion
        const order = await this._ordersRepo.findOrdersById(orderId);
        const tasks = [
            this._orderDetailService.deleteOrderDetail(orderId),
            this._orderSeatService.deleteOrderSeat(orderId),
        ];

        if (order?.promotion?.id) {
            tasks.push(this._promotionService.effectPromotion(order.promotion.id, 'ADD'));
        }
        return await Promise.all(tasks);
    }

    private async schedulePendingOrderExpiration(
        orderId: string,
        orderData: unknown,
        seconds = 5 * 60,
    ) {
        await this.runtimeStateService.setPendingOrder(
            orderId,
            orderData,
            async () => {
                const handled = await this.checkAndCancelOrder(orderId);
                if (handled === false) {
                    await this.cancelOrder(orderId);
                }
            },
            seconds,
        );
    }

    async checkAndCancelOrder(orderId) {

        // await this.resetVoucher(orderId);

        const check = await this._ordersRepo.getOrderInfo(orderId);
        if (check.length <= 0) {
            return false;
        }

        if (!check[0]?.InfoOrderPayment) {
            await this.deleteOrder(orderId);
            return true;
        }

        if (check[0]?.InfoOrderPayment && check[0].InfoOrderPayment?.status === OrderStatus.PAID) {
            return true;
        }

        if (
            check[0]?.InfoOrderPayment &&
            check[0].InfoOrderPayment?.status === OrderStatus.CANCELED
        ) {
            return true;
        }

        return false;
    }

    async getSeatOrderEvent(eventId, showtimeId) {
        const data = await this._ordersRepo.getOrderSeats(eventId, showtimeId);

        const result = data.flatMap((order) =>
            order.InfoSeat.map((seat) => ({
                seat_id: seat.seat_id,
                name_seat: seat.name_seat,
                payment_status: order.InfoPayment.status,
            })),
        );
        return result;
    }

    async findById(id) {
        return await this._ordersRepo.findOrdersById(id);
    }

    async updateOrder(order) {
        this._ordersRepo.updateOrders(order._id, order);
    }
    async getTicketInEvent(eventId: string) {
        return await this._ordersRepo.findOrdersByCondition({
            event_id: StringUtils.ObjectId(eventId),
            //  status: OrderStatus.PAID
        });
    }

    async updateOrder1(id, data) {
        return await this._ordersRepo.updateOrders(id, data);
    }

    async createOrderByStaff(username: string, createOrder: any) {
        const customerInfo: any = {
            phone: createOrder.phone,
            name: createOrder.name,
            email: createOrder.email,
        };

        const newUser = await this._userService.findOneByGmailOrPhone(
            createOrder.phone,
            createOrder.email,
        );

        let user = null;

        if (newUser && newUser._id) {
            user = newUser;
        } else {
            user = await this._userService.createUser(customerInfo);
        }

        const userInfo = await this._userService.findByGoogleId(username);

        const idOrder = StringUtils.generateObjectId();
        const code = RandomCodeUtils.generateUniqueCode(15);

        // prepare the bill
        let price = 0;
        const orderDetail = createOrder.createOrderDetail;
        const comboIds = orderDetail.combo_info.map((item) => StringUtils.ObjectId(item.comboId));
        const priceCombos = await this._comboEventService.countPrice(comboIds);
        price += priceCombos;

        const orderUpsell = orderDetail.item_upsell;
        const upSellItem = await this._menuItemService.countPrice(orderUpsell);
        price += upSellItem;

        let data: any = {};

        // promotion check
        if (createOrder.promotion_code) {
            const promotion = await this._promotionService.getPromotionByCode(
                createOrder.promotion_code,
            );
            if (!promotion) {
                throw MessageCode.PROMOTION.PROMOTION_NOT_FOUND;
            }

            // Handle CTV promotions differently
            if (promotion.for_type === PromotionForType.CTV) {
                const usedPromotion = await this._promotionService.usePromotion(
                    createOrder.promotion_code,
                    user._id
                );

                if (usedPromotion) {
                    switch (promotion.type_price) {
                        case TypePromotion.PERCENT:
                            price = price - price * (promotion.price / 100);
                            break;
                        case TypePromotion.VND:
                            price = price - promotion.price;
                            break;
                    }
                    data['promotion'] = {
                        id: promotion._id,
                        code: promotion.code,
                        name: promotion.name,
                        price: promotion.price,
                        type_price: promotion.type_price,
                    };
                }
                await this._promotionService.effectPromotion(String(promotion._id), 'MINUS');
            } else {
                // Handle regular promotions
                if (promotion.max_quantity < 1) {
                    throw MessageCode.PROMOTION.PROMOTION_USED_UP;
                }

                switch (promotion.type_price) {
                    case TypePromotion.PERCENT:
                        price = price - price * (promotion.price / 100);
                        break;
                    case TypePromotion.VND:
                        price = price - promotion.price;
                        break;
                }
                data['promotion'] = {
                    id: promotion._id,
                    code: promotion.code,
                    name: promotion.name,
                    price: promotion.price,
                    type_price: promotion.type_price,
                };

                await this._promotionService.effectPromotion(String(promotion._id), 'MINUS');
            }
        }

        data = {
            ...data,
            _id: idOrder,
            uid: user._id,
            event_id: StringUtils.ObjectId(createOrder.event_id),
            showtimes_id: StringUtils.ObjectId(createOrder.showtimes_id),
            ...(createOrder.employee_id && { employee_id: createOrder.employee_id }),
            code: code,
            total_price: price,
            referred_by: createOrder.referred_by ? createOrder.referred_by : null,
            employee_id: userInfo._id,
        };

        try {
            const res = await Promise.all([
                this._ordersRepo.createOrders(data),
                this._orderDetailService.createOrderItems(
                    idOrder,
                    user,
                    createOrder.event_id,
                    orderDetail,
                ),
            ]);
            await this.schedulePendingOrderExpiration(idOrder, res);
            this._gatewayWebSocket.sendDataSeat(createOrder.event_id, createOrder.showtimes_id);
            return res;
        } catch (error) {
            if (data.promotion && data.promotion.id) {
                await this.resetVoucher(idOrder);
            }
            await this.deleteOrder(idOrder);
            throw error;
        }
    }

    async getOrderRevenueByPeriod(start: Date, end: Date): Promise<number> {
        return await this._ordersRepo.getOrderRevenueByPeriod(start, end);
    }

    async getOrderListForAnalytics(start: Date, end: Date): Promise<any[]> {
        return await this._ordersRepo.getOrderListForAnalytics(start, end);
    }

    async orderPayment(orderId: string, orderStatus: OrderStatus) {
        const order = await this.findById(orderId);
        if (!order) {
            throw MessageCode.ORDERS.ORDER_NOT_FOUND;
        }
        const userOrder = await this._userService.findById(order.uid);
        const dataUpdateOrder: any = {};
        let point = 0;

        if (orderStatus === OrderStatus.PAID) {
            point = this.calculatePoints(order.total_price);
            dataUpdateOrder.point_order = point;
            dataUpdateOrder.status = OrderStatus.CONFIRMED;
            if (order.referred_by) {
                const dataUpdate = await this._userService.coutPointForUserReferred(
                    order.referred_by,
                    order.total_price,
                );
                const poinReferred = dataUpdate.point;
                dataUpdateOrder.point_referred = poinReferred;
            }

            // xử lý thông tin
            let orderUpdate;
            this._mailerService.sendEmailPaid(
                userOrder.email,
                userOrder.name,
                order,
                `${process.env.FE_URI}/ve/${String(orderId)}`,
                new UserModel(userOrder),
            );
            
            this._userService.deleteGuestUser(userOrder._id);
            const dataLog = {
                uid: order.uid,
                type: TypeBuy.ORDER,
                price: order.total_price,
            };
            orderUpdate = await this.updateOrder1(order._id, dataUpdateOrder);

            await this._memberLogService.createLog(dataLog);

            const resSocket: any = {}
            resSocket.phone = userOrder.phone
            resSocket.email = userOrder.email
            resSocket.orderId = orderUpdate._id
            const dataInternal = await this.runtimeStateService.getUsersInternal();
            this._gatewayWebSocket.sendData(MsgType.PAID_INVOICE, dataInternal, {...orderUpdate._doc, ...resSocket});
            
            // Send Telegram notification
            try {
                const orderFullData = await this.getOrderById(orderUpdate._id);
                await this._systemService.sendOrderNotification(
                    orderFullData[0] || orderUpdate,
                    userOrder,
                    orderFullData[0]?.InfoEvent || null
                );
            } catch (error) {
                this.logger.error('Failed to send Telegram notification:', error);
                // Don't throw - notification failure shouldn't break the flow
            }
            
            return orderUpdate;
        }
    }

    calculatePoints(invoiceAmount: number): number {
        return Math.floor(invoiceAmount / 10000);
    }

    async handleTest() {
        const xxx = '682e7f23ff58e693830f9c26'
        const orderData:any = await this.findById(xxx);
        const userOrder = await this._userService.findById(orderData.uid);
        const resSocket: any = {}
        resSocket.phone = userOrder.phone
        resSocket.email = userOrder.email
        resSocket.orderId = xxx

        const dataInternal = await this.runtimeStateService.getUsersInternal();
        this._gatewayWebSocket.sendData(MsgType.PAID_INVOICE, dataInternal, {...orderData._doc, ...resSocket});
        this._gatewayWebSocket.sendData(MsgType.PAID_INVOICE, dataInternal, {...orderData._doc, ...resSocket});
        
        return null;
    }

    async resetVoucher (orderId: any){
        try {
            const order = await this.findById(orderId);
            if (order && order.promotion) {
                await this._promotionService.recoverVoucher(order.promotion.id);
            }
        } catch (error) {
            
        }
        
    }
}
