import { Injectable } from '@nestjs/common';
import { VNPayTransactionRepo } from './vnp_transaction.repo';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { VNPayTransactionsDocument } from './schema/vnp_transactions.scheme';
import mongoose from 'mongoose';
import { OrdersService } from 'src/orders/orders.service';
import { OrderStatus } from 'src/orders/enum/status.enum';

@Injectable()
export class VNPayTransactionService {
  constructor(
    private readonly _vnpTransactionRepo: VNPayTransactionRepo,
    private readonly orderService: OrdersService
  ) {}

  // CRUD cho giao dịch VNPay
  async createTransaction(data: any): Promise<VNPayTransactionsDocument> {
    return await this._vnpTransactionRepo.createTransaction(data);
  }

  async updateTransaction(txnRef: string, data: any): Promise<VNPayTransactionsDocument> {
    const transaction = await this._vnpTransactionRepo.findTransactionByCondition({ txnRef });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return await this._vnpTransactionRepo.updateTransaction(transaction._id, data);
  }

  async getTransactionByCondition(condition: any): Promise<VNPayTransactionsDocument> {
    return await this._vnpTransactionRepo.findTransactionByCondition(condition);
  }

  async deleteTransaction(txnRef: string): Promise<VNPayTransactionsDocument> {
    const transaction = await this._vnpTransactionRepo.findTransactionByCondition({ txnRef });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return await this._vnpTransactionRepo.deleteTransaction(transaction._id);
  }

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
    const returnUrl = process.env.BE_URI + '/vnp_transaction/vnpay_return';

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

    // Lưu giao dịch vào DB trước khi tạo URL
    const transactionData = {
      txnRef: orderId,
      amount: amount,
      orderId: orderId ? new mongoose.Types.ObjectId(body.orderId) : null, // TODO: xử lý chỗ này
      userId: user.sub ? new mongoose.Types.ObjectId(user.sub) : null, // TODO: xử lý chỗ này
      bankCode: bankCode || null,
      ipAddr: ipAddr,
      responseCode: null,
      transactionStatus: '0', // trạng thái khởi tạo
      secureHash: null,
      payDate: null,
      bankTranNo: null,
    };

    await this._vnpTransactionRepo.createTransaction(transactionData);

    return vnpUrl;
  }

  // Xử lý kết quả trả về từ VNPay (vnpay_return)
  async handleReturn(vnpParams: any): Promise<any> {
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
      const updateData = {
        responseCode: vnpParams['vnp_ResponseCode'],
        transactionStatus: vnpParams['vnp_TransactionStatus'],
        payDate: vnpParams['vnp_PayDate'] ? vnpParams['vnp_PayDate'] : null,
        bankTranNo: vnpParams['vnp_BankTranNo'],
        secureHash: secureHash,
      };
  
      // Tìm giao dịch dựa trên txnRef và cập nhật thông tin
      const transaction = await this._vnpTransactionRepo.findTransactionByCondition({ txnRef });
      if (transaction) {
        await this._vnpTransactionRepo.updateTransaction(transaction._id, updateData);
        const order = await this.orderService.findById(txnRef);
        order.status = OrderStatus.PAID;
        await this.orderService.updateOrder(order)
        
      }
      return { code: vnpParams['vnp_ResponseCode'] };
    } else {
      return { code: '97' };
    }
  }

  // Xử lý callback IPN từ VNPay
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

    const transaction = await this._vnpTransactionRepo.findTransactionByCondition({ txnRef: orderId });

    const updateData = {
      responseCode: rspCode,
      transactionStatus: rspCode === "00" ? '1' : '2', // '1': thành công, '2': thất bại
      payDate: vnpParams['vnp_PayDate'] ? vnpParams['vnp_PayDate'] : null,
      bankTranNo: vnpParams['vnp_BankTranNo'],
      secureHash: secureHash,
    };

    await this._vnpTransactionRepo.updateTransaction(transaction._id, updateData);

    return {...returnStatus};
  }

  // Truy vấn giao dịch (querydr)
  // async queryDR(queryData: any): Promise<any> {
  //   process.env.TZ = 'Asia/Ho_Chi_Minh';
  //   const date = new Date();
  //   const tmnCode = "UCILA15T";
  //   const secretKey = "FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41";
  //   const vnp_Api = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

  //   const vnp_TxnRef = queryData.orderId;
  //   const vnp_TransactionDate = queryData.transDate;
  //   const vnp_RequestId = moment(date).format('HHmmss');
  //   const vnp_Version = '2.1.0';
  //   const vnp_Command = 'querydr';
  //   const vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;
  //   const ipAddr = queryData.ipAddr || '127.0.0.1';
  //   const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

  //   const data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + tmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + ipAddr + "|" + vnp_OrderInfo;
  //   const hmac2 = crypto.createHmac("sha512", secretKey);
  //   const vnp_SecureHash = hmac2.update(Buffer.from(data, 'utf-8')).digest("hex");

  //   const dataObj = {
  //     vnp_RequestId,
  //     vnp_Version,
  //     vnp_Command,
  //     vnp_TmnCode: tmnCode,
  //     vnp_TxnRef,
  //     vnp_OrderInfo,
  //     vnp_TransactionDate,
  //     vnp_CreateDate,
  //     vnp_IpAddr: ipAddr,
  //     vnp_SecureHash
  //   };

  //   return new Promise((resolve, reject) => {
  //     request({
  //       url: vnp_Api,
  //       method: "POST",
  //       json: true,
  //       body: dataObj
  //     }, function (error, response, body) {
  //       if (error) {
  //         return reject(error);
  //       }
  //       resolve(body);
  //     });
  //   });
  // }

  // Xử lý hoàn tiền (refund)
  // async refund(refundData: any): Promise<any> {
  //   process.env.TZ = 'Asia/Ho_Chi_Minh';
  //   const date = new Date();
  //   const tmnCode = "UCILA15T";
  //   const secretKey = "FBH4GZLIUJKS47ROVAZ6NF5JOZAXUR41";
  //   const vnp_Api = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

  //   const vnp_TxnRef = refundData.orderId;
  //   const vnp_TransactionDate = refundData.transDate;
  //   const vnp_Amount = refundData.amount * 100;
  //   const vnp_TransactionType = refundData.transType;
  //   const vnp_CreateBy = refundData.user;
  //   const vnp_RequestId = moment(date).format('HHmmss');
  //   const vnp_Version = '2.1.0';
  //   const vnp_Command = 'refund';
  //   const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
  //   const ipAddr = refundData.ipAddr || '127.0.0.1';
  //   const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
  //   const vnp_TransactionNo = '0';

  //   const data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + tmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + ipAddr + "|" + vnp_OrderInfo;
  //   const hmacRefund = crypto.createHmac("sha512", secretKey);
  //   const vnp_SecureHash = hmacRefund.update(Buffer.from(data, 'utf-8')).digest("hex");

  //   const dataObj = {
  //     vnp_RequestId,
  //     vnp_Version,
  //     vnp_Command,
  //     vnp_TmnCode: tmnCode,
  //     vnp_TransactionType,
  //     vnp_TxnRef,
  //     vnp_Amount,
  //     vnp_TransactionNo,
  //     vnp_CreateBy,
  //     vnp_OrderInfo,
  //     vnp_TransactionDate,
  //     vnp_CreateDate,
  //     vnp_IpAddr: ipAddr,
  //     vnp_SecureHash
  //   };

  //   return new Promise((resolve, reject) => {
  //     request({
  //       url: vnp_Api,
  //       method: "POST",
  //       json: true,
  //       body: dataObj
  //     }, function (error, response, body) {
  //       if (error) {
  //         return reject(error);
  //       }
  //       resolve(body);
  //     });
  //   });
  // }

  // Helper: sắp xếp các key của object theo thứ tự tăng dần
  private sortObject(obj: any): any {
    let sorted: any = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    }
    return sorted;
  }
}
