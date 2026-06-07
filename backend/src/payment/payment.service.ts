
import { MessageCode } from 'src/common/exception/MessageCode';
import { PaymentRepo } from './payment.repo';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { StringUtils } from 'src/common/utils/string.utils';
import { UsersService } from 'src/users/users.service';
import { OrderStatus } from 'src/orders/enum/status.enum';
import { OrdersService } from 'src/orders/orders.service';
import { MailerService } from 'src/mailer/mailer.service';
import { UserModel } from 'src/users/model/user.model';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as qs from 'qs';
import mongoose from 'mongoose';
import { UpdatePayment } from './dto/update.dto';
import { Seat_sectionService } from 'src/seat_section/seat_section.service';
import { Order_seatService } from 'src/order_seat/order_seat.service';
import { CreatePayment } from './dto/create.dto';
import { Membership_logsService } from 'src/membership_logs/membership_logs.service';
import { TypeBuy } from 'src/membership_logs/enum/type.enum';
import { Membership_pricesService } from 'src/membership_prices/membership_prices.service';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
@Injectable()
export class PaymentService {
    constructor(private readonly _paymentRepo: PaymentRepo,
        private readonly _userService: UsersService,
        @Inject(forwardRef(() => OrdersService)) private readonly _orderService: OrdersService,
        private readonly _mailerService: MailerService,
        private readonly _seat_sectionService: Seat_sectionService,
        private readonly _order_seatService: Order_seatService,
        private readonly _memberLogService: Membership_logsService,
        private readonly _memberShipPriceService: Membership_pricesService,

    ) { }

    // Tạo URL thanh toán VNPay với dữ liệu nhận từ body (POST)
    async createPaymentUrl(body: any, user: any): Promise<string> {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        // Lấy IP từ body hoặc dùng mặc định
        const ipAddr = body.ipAddr || '127.0.0.1';

        const tmnCode = 'UCILA15T';
        const secretKey = 'FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41';
        let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = process.env.BE_URI + '/payment/vnpay_return';

        // Tạo mã đơn hàng dựa vào thời gian
        const orderId = body.orderId;
        const amount = body.amount;
        const bankCode = body.bankCode;
        let locale = body.language || 'vn';
        const currCode = 'VND';

        let vnp_Params: any = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = this.sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        let uid = null;
        if (user?.sub) {
            uid = new mongoose.Types.ObjectId(user.sub)
        } else {
            const user = await this._userService.findByPhone(body.phone);
            uid = user._id
        }

        // Lưu giao dịch vào DB trước khi tạo URL
        const transactionData = {
            // _id: StringUtils.generateObjectId(),
            txnRef: orderId,
            amount: amount,
            order_id: orderId ? new mongoose.Types.ObjectId(body.orderId) : null, // TODO: xử lý chỗ này
            uid: uid, // TODO: xử lý chỗ này
            bankCode: bankCode || null,
            ipAddr: ipAddr,
            responseCode: null,
            transactionStatus: '0', // trạng thái khởi tạo
            secureHash: null,
            payDate: null,
            bankTranNo: null,
            payment_method: null //TODO: Fix it
        };

        console.log('transsaction', transactionData)

        await this._paymentRepo.createPayment(transactionData);

        return vnpUrl;
    }

    async handleReturn(vnpParams: any): Promise<any> {
        const rspCode = vnpParams['vnp_ResponseCode'];
        const secureHash = vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];
        vnpParams = this.sortObject(vnpParams);
        const secretKey = "FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41";
        const signData = qs.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            const txnRef = vnpParams['vnp_TxnRef'];
            const transactionStatus = vnpParams['vnp_TransactionStatus'];
            const updateData = {
                responseCode: rspCode,
                transactionStatus: transactionStatus,
                payDate: vnpParams['vnp_PayDate'] ? vnpParams['vnp_PayDate'] : null,
                bankTranNo: vnpParams['vnp_BankTranNo'],
                secureHash: secureHash,
                status: OrderStatus.PAID
            };
            const order = await this._orderService.findById(txnRef);
            const userOrder = await this._userService.findById(order.uid);
            if (rspCode == "00") {
                // Tìm giao dịch dựa trên txnRef và cập nhật thông tin
                const transaction: any = await this._paymentRepo.findOnePaymentByCondition({ txnRef });
                
                if (transaction) {
                    updateData.status = OrderStatus.PAID
                    await this._paymentRepo.findOneUpdate(transaction._id, updateData);

                    order.status = OrderStatus.PAID;
                    await this._orderService.updateOrder(order)

                    let point = 0;
                    // tích điểm
                    point = this.calculatePoints(order.total_price);
                    if (order.referred_by) {
                        const getUserReferred = await this._userService.getUserReferred(order.referred_by);
                        if (getUserReferred) {
                            await this._userService.updatePointUser(getUserReferred._id, point)
                        }
                    }

                    

                    const orderSeats = await this._order_seatService.getOrderSeatListByOrderId(order._id);

                    const seatSectionList = await this._seat_sectionService.getSeatListByCondition({ event_id: order.event_id })

                    for (let i = 0; i < seatSectionList.length; i++) {
                        const seatSection = seatSectionList[i];

                        let isChange = false;
                        const seatUpdateData = [];

                        for (let z = 0; z < seatSection.data_seat.length; z++) {
                            const seat = seatSection.data_seat[z];

                            for (let g = 0; g < orderSeats.length; g++) {
                                const orderSeat = orderSeats[g];

                                if (orderSeat.name_seat == seat.name) {
                                    isChange = true
                                    seat.booked = true
                                }
                            }

                            seatUpdateData.push(seat)
                        }

                        seatSection.data_seat = seatUpdateData;

                        if (isChange = true) {
                            await this._seat_sectionService.updateSeat_sectionById(seatSection._id, seatSection)
                        }
                    }

                    this._mailerService.sendEmailPaid(userOrder.email, userOrder.name, order, `${process.env.FE_URI}/ve/${order._id}`)

                }

                return { code: vnpParams['vnp_ResponseCode'], orderCode: order._id };


            } else {
                const transaction: any = await this._paymentRepo.findOnePaymentByCondition({ txnRef });
                if (transaction) {
                    let orderStatus = null;
                    switch (rspCode) {
                        case 11:
                            updateData.status = OrderStatus.CANCELED
                            orderStatus = OrderStatus.CANCELED
                            break;
                        case 24:
                            updateData.status = OrderStatus.CANCELED
                            orderStatus = OrderStatus.CANCELED
                            break;
                        default:
                            updateData.status = OrderStatus.FAILED
                            orderStatus = OrderStatus.FAILED
                            break;
                    }
                    await this._paymentRepo.findOneUpdate(transaction._id, updateData);
                    const order = await this._orderService.findById(txnRef);
                    order.status = OrderStatus.PAID;
                    order.referred_by = null;
                    await this._orderService.updateOrder(order)

                    return { code: vnpParams['vnp_ResponseCode'], orderCode: order._id };
                }
            }
        } else {
            return { code: '97' };
        }
    }

    async handleIPN(vnpParams: any): Promise<any> {
        const secureHash = vnpParams['vnp_SecureHash'];
        const orderId = vnpParams['vnp_TxnRef'];
        const rspCode = vnpParams['vnp_ResponseCode'];

        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];
        vnpParams = this.sortObject(vnpParams);
        const secretKey = "FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41";
        const signData = qs.stringify(vnpParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // Giả sử kiểm tra trạng thái, số tiền, tồn tại đơn hàng,...
        const paymentStatus = '0';
        const checkOrderId = true;
        const checkAmount = true;

        const returnStatus = { RspCode: '-1', Message: 'Unknow' }
        if (secureHash === signed) {
            if (checkOrderId) {
                if (checkAmount) {
                    if (paymentStatus == "0") {
                        if (rspCode == "00") {
                            returnStatus.RspCode = '00';
                        }
                    } else {
                        returnStatus.RspCode = '02';
                    }
                } else {
                    returnStatus.RspCode = '04';
                }
            } else {
                returnStatus.RspCode = '01';
            }
        } else {
            returnStatus.RspCode = '97';
        }

        const transaction: any = await this._paymentRepo.findOnePaymentByCondition({ txnRef: orderId });

        const updateData = {
            responseCode: rspCode,
            transactionStatus: rspCode === "00" ? '1' : '2', // '1': thành công, '2': thất bại
            payDate: vnpParams['vnp_PayDate'] ? vnpParams['vnp_PayDate'] : null,
            bankTranNo: vnpParams['vnp_BankTranNo'],
            secureHash: secureHash,
        };

        await this._paymentRepo.findOneUpdate(transaction._id, updateData);

        const order = await this._orderService.findById(orderId);

        let point = 0;
        // tích điểm
        point = this.calculatePoints(order.total_price);
        if (order.referred_by) {
            const getUserReferred = await this._userService.getUserReferred(order.referred_by);
            if (getUserReferred) {
                await this._userService.updatePointUser(getUserReferred._id, point)
            }
        }

        const userOrder = await this._userService.findById(order.uid);

        await this._userService.removeUserGuest(userOrder)

        this._mailerService.sendEmailPaid(userOrder.email, userOrder.name, order, `${process.env.FE_URI}/ve/${order._id}`)

        return { ...returnStatus };
    }

    async createPaymentOrder(username, createOrder: CreatePayment) {
        const user = await this._userService.findByPhone(username);
        // Check if order has been paid
        const getPaymentOrder = await this._paymentRepo.findOnePaymentByCondition({
            order_id: createOrder.order_id
        })
        if (getPaymentOrder) {
            throw MessageCode.REQUEST.BAD_REQUEST
        }

        const data = {
            _id: StringUtils.generateObjectId(),
            order_id: StringUtils.ObjectId(createOrder.order_id),
            amount: 123,
            txnRef: RandomCodeUtils.generateUniqueCode(5),
            uid: user._id,
            payment_method: createOrder.payment_method,
            status: createOrder.status
        }

        return await this._paymentRepo.createPayment(data);
    }

    async findOnePaymentByCondition(condition: any) {
        return await this._paymentRepo.findOnePaymentByCondition(condition);
    }

    async markPaymentAsPaid(idOrder){
        const payment: any = await this._paymentRepo.findOnePaymentByCondition({ order_id: StringUtils.ObjectId(idOrder) })
        const dataUpdate = {
            status: OrderStatus.PAID
        }
        return await this._paymentRepo.updatePayment(payment._id, dataUpdate);
    }

    // bỏ
    async updatePayment(idOrder, updatePayment: UpdatePayment | any, username?: string) {
        const order = await this._orderService.findById(idOrder);
        if (!order) {
            throw MessageCode.ORDERS.ORDER_NOT_FOUND;
        }
        const userOrder = await this._userService.findById(order.uid);

        if (username) {
            const user = await this._userService.findByPhone(username);
            updatePayment['uid_update'] = user._id
        }
        // data update order
        const dataUpdateOrder : any = {};
        //

        const payment: any = await this._paymentRepo.findOnePaymentByCondition({ order_id: StringUtils.ObjectId(idOrder) })
        let point = 0;
        if (updatePayment.status && updatePayment.status === OrderStatus.PAID) {
            // tích điểm cho người giới thiệu 
            point = this.calculatePoints(order.total_price); 
            dataUpdateOrder.point_order = point;
            dataUpdateOrder.status = OrderStatus.CONFIRMED
            if (order.referred_by) {
                // const getUserReferred = await this._userService.getUserReferred(order.referred_by);
                // if (getUserReferred) {
                //     await this._userService.updatePointUser(getUserReferred._id, point)
                // }
               const dataUpdate = await this._userService.coutPointForUserReferred(order.referred_by, order.total_price);
               const poinReferred = dataUpdate.point;
               dataUpdateOrder.point_referred = poinReferred;
            }
            // trừ điểm nếu có voucher - hiện tại đã trừ khi mua voucher, còn muốn bật cái này thì tắt comment
            // if(order?.promotion){
            //     const promotion = await this._promotionService.getPromotionById(String(order.promotion.id));
            //     const newPoin = (userOrder.point? userOrder.point: 0) - promotion.required_points;

            //     if(newPoin < 0) throw MessageCode.POINT.POINTS_NOT_ENOUGH
            //     console.log('poin -', -promotion.required_points)
            //     await this._userService.updatePointUser(userOrder._id, - Number(promotion.required_points))
            // }
            //
        }

        const [paymentRes, userData] = await Promise.all([
            this._paymentRepo.updatePayment(payment._id, updatePayment),
            // - Hiện tại không mua dell cộng điểm j hết muốn cộng thì đổi 0 thành point
            this._userService.updatePointUser(payment.uid, 0)
        ]);
        const userModel = new UserModel(userData);
        let orderUpdate;
        if (updatePayment.status && updatePayment.status === OrderStatus.PAID) {
            this._mailerService.sendEmailPaid(userOrder.email, userOrder.name, order, `${process.env.FE_URI}/ve/${String(idOrder)}`, userModel);
            // xóa loại khách hàng
            this._userService.deleteGuestUser(userOrder._id);
            // create log
            const dataLog = {
                uid: order.uid,
                type: TypeBuy.ORDER,
                price: order.total_price
            }
            // update order status
            orderUpdate = await this._orderService.updateOrder1(order._id, dataUpdateOrder);
            //
            this._memberLogService.createLog(dataLog)
        }
        return [paymentRes, orderUpdate];
    }

    calculatePoints(invoiceAmount: number): number {
        return Math.floor(invoiceAmount / 10000);
    }

    async deletePaymentByOrder(orderId) {
        return await this._paymentRepo.deletePaymentByCondition({ order_id: StringUtils.ObjectId(orderId) })
    }

    private sortObject(obj: any): any {
        let sorted: any = {};
        let keys = Object.keys(obj).sort();
        for (let key of keys) {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        }
        return sorted;
    }

    async createMembershipPaymentUrl(body: any, user: any): Promise<string> {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const ipAddr = body.ipAddr || '127.0.0.1';

        // Các thông tin cấu hình VNPay
        const tmnCode = 'UCILA15T';
        const secretKey = 'FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41';
        let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        // URL trả về sau khi thanh toán membership
        const returnUrl = process.env.BE_URI + '/payment/vnpay_return_membership';

        const amount = body.amount; // Giá của hạng thẻ
        const bankCode = body.bankCode;
        let locale = body.language || 'vn';
        const currCode = 'VND';

        let vnp_Params: any = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = body.type + '-' + createDate;
        vnp_Params['vnp_OrderInfo'] = user.sub;
        vnp_Params['vnp_OrderType'] = 'membership';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu số tiền * 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = this.sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        return vnpUrl;
    }


    async handleReturnMembership(vnpParams: any): Promise<any> {
        try {
            const rspCode = vnpParams['vnp_ResponseCode'];
            const secureHash = vnpParams['vnp_SecureHash'];
            delete vnpParams['vnp_SecureHash'];
            delete vnpParams['vnp_SecureHashType'];
            vnpParams = this.sortObject(vnpParams);
            const secretKey = "FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41";
            const signData = qs.stringify(vnpParams, { encode: false });
            const hmac = crypto.createHmac('sha512', secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            if (secureHash !== signed) {
                return { code: '97' };
            }

            if (rspCode === "00") {
                const txnRef = vnpParams['vnp_TxnRef'].split("-")[0];
                // Giả sử định dạng txnRef là "M{membershipType}{...}"
                // const membershipType = txnRef.substring(1, 2);
                // Lấy thông tin hạng vé từ membership_prices theo membershipType
                console.log('txnRef', txnRef)
                const membershipPriceObj = await this._memberShipPriceService.findByType(txnRef);
                if (!membershipPriceObj) {
                    return { code: '99', message: 'Không tìm thấy hạng thẻ tương ứng' };
                }
                // Lấy giá từ hạng vé
                const price = membershipPriceObj.priceInMonth;
                // Lấy uid từ vnp_OrderType (đã được set khi tạo URL thanh toán)
                const uid = vnpParams['vnp_OrderInfo'];

                console.log('membershipPriceObj', uid)

                // Chỉ insert log nếu giao dịch thành công
                const logData = {
                    uid: uid, // uid từ vnp_OrderType (có thể cần chuyển đổi kiểu nếu cần)
                    type: TypeBuy.MEMBERSHIP,
                    price: price,
                };
                await this._memberLogService.createLog(logData);

                // Cập nhật hạng thẻ cho người dùng bằng cách gọi UsersService.updateCustomerType
                const updateData = {
                    uid: uid,
                    priceMemberShipId: membershipPriceObj._id,
                    time: 1, // Ví dụ: gia hạn thêm 1 tháng; điều chỉnh theo nghiệp vụ
                };
                await this._userService.updateCustomerType(updateData);

                // Lấy thông tin người dùng để gửi email
                const user = await this._userService.findById(uid);
                if (user && user.email) {
                    // Gửi email thông báo mua thẻ thành công
                    await this._mailerService.sendEmailMembership(
                        user.email, 
                        user.name, 
                        membershipPriceObj,
                        process.env.FE_URI + '/customer/my-type',
                        txnRef
                    );
                }

                return { code: rspCode, orderCode: txnRef };
            } else {
                return { code: rspCode };
            }
        } catch (error) {
            console.log('error', error)
        }
    }


    async updatePaymentStatus(idOrder, status: OrderStatus.CANCELED | OrderStatus.PENDING ) {
        return await this._paymentRepo.updatePayment(idOrder, { status: status });
    }

    async createPaymentMemberShipLog(username, createOrder: any) {
        const user = await this._userService.findByPhone(username);
        const logData = {
            uid: user._id,
            type: TypeBuy.MEMBERSHIP,
            price: createOrder.amount,
            status: 'NOT_PAID'
        };
        await this._memberLogService.createLog(logData);
    }

    async markMemberShipAsPaid(uid: string, memberType: any) {
        try {
            const membershipPriceObj = await this._memberShipPriceService.findByType(memberType);
            if (!membershipPriceObj) {
                console.log('error markMemberShipAsPaid 1', memberType)
                return { code: '99', message: 'Không tìm thấy hạng thẻ tương ứng' };
            }
            const price = membershipPriceObj.priceInMonth;
            const logData = {
                uid: uid,
                type: TypeBuy.MEMBERSHIP,
                price: price,
            };
            await this._memberLogService.createLog(logData);
            const updateData = {
                uid: uid,
                priceMemberShipId: membershipPriceObj._id,
                time: 1, // Ví dụ: gia hạn thêm 1 tháng; điều chỉnh theo nghiệp vụ
            };
            await this._userService.updateCustomerType(updateData);
            const user = await this._userService.findById(uid);
            if (user && user.email) {
                // Gửi email thông báo mua thẻ thành công
                await this._mailerService.sendEmailMembership(
                    user.email, 
                    user.name, 
                    membershipPriceObj,
                    process.env.FE_URI + '/customer/my-type',
                    memberType
                );
            }
        } catch (error) {
            console.log('error markMemberShipAsPaid 2', error)
            throw MessageCode.REQUEST.BAD_REQUEST;
        }
        
    }

    async calculatePriceForMembership(username, memberType, amount): Promise<any> {

        // case 0: Nếu memberType là Q: return amount
        if (memberType === 'Q') {
            return amount;
        }

        const user = await this._userService.findByPhone(username);
        const uid = user._id;

        // check customer_type có tồn tại không
        if (user.customer_type == 'J' || !user.customer_type || !user.customer_type_expiry) {
            // Nếu không có hạng thẻ, trả về số tiền gốc
            return amount;
        } else {
            // Lấy thông tin hạng thể hiệ tại
            const expiryDate = new Date(user.customer_type_expiry);
            const currentDate = new Date();
            // Kiểm tra xem hạng thẻ có còn hiệu lực không
            // Case 1: Nếu đã hết hạn hoặc chưa có hạng thẻ: return amount
            if (expiryDate <= currentDate) {
                return amount;
            }

            // Case 2: Nếu còn hạn, và nâng từ Q lên hạng K

            // Lấy danh sách membership_logs theo uid
            const membershipLogs = await this._memberLogService.getMembershipLogsByUserId(uid);

            // Lấy ra membershipLog updated_at mới nhất
            const latestLog = membershipLogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

            const startDate = new Date(latestLog.updatedAt); // Ngày bắt đầu tính toán từ ngày cập nhật mới nhất

            console.log('ngày bắt đầu', startDate,latestLog.updatedAt,latestLog)
            console.log('ngày hết hạn', expiryDate)
            // Lấy tổng số ngày đã mua (0)
            const totalDaysPurchased = moment(expiryDate).diff(moment(startDate), 'days');
            console.log('tổng số ngày đã mua', totalDaysPurchased)

            // Lấy giá đã từng mua (1)
            const totalPricePurchased = latestLog.price;
            console.log('tổng giá đã mua', totalPricePurchased)

            // Lấy hạn sử dụng của hạng thẻ hiện tại (2) = expiryDate

            // Lấy giá đã mua chia cho số ngày (3) = (1/0)
            const pricePerDay = totalPricePurchased / totalDaysPurchased;
            console.log('giá đã mua chia cho số ngày', pricePerDay)

            // Số tiền còn lại (4) = (0 - 2) * 3
            const remainingDays = moment(expiryDate).diff(moment(currentDate), 'days');
            console.log('số ngày còn lại', remainingDays)

            // --------------------------------------

            // Giá của hạng thẻ hiện tại (5): amount

            // Số tiền cần thanh toán (6) = (5 - 4)
            const priceToPay = (amount - (remainingDays * pricePerDay));
            console.log('số tiền cần thanh toán', priceToPay)

            // Trả về số tiền cần thanh toán (làm tròn đến hàng nghìn), nếu nhỏ hơn 0 thì trả về 0

            if (priceToPay <= 0) {
                return 5000;
            }

            return Math.max(0, Math.round(priceToPay / 1000) * 1000);

        }
        

        
        return 0;
    }
}
