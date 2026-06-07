import { StringUtils } from 'src/common/utils/string.utils';
import { CreateOrderDetail } from './dto/create.dto';
import { Order_detailRepo } from './order_detail.repo';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Menu_itemService } from 'src/menu_item/menu_item.service';
import { MessageCode } from 'src/common/exception/MessageCode';
import { Combo_eventService } from 'src/combo_event/combo_event.service';
import { MenuOrderType } from 'src/menu_order/enum/type.enum';
import { Menu_orderService } from 'src/menu_order/menu_order.service';
import { TypeItem } from 'src/menu_item/enum/type.enum';
import { Seat_sectionService } from 'src/seat_section/seat_section.service';
import { ApiException } from 'src/common/exception/ApiException';
import { async } from 'rxjs';
import { UpdateMenuFree } from './dto/updateComboFree.dto';

@Injectable()
export class Order_detailService {
  constructor(
    private readonly _order_detailRepo: Order_detailRepo,
    private readonly _comboEventService: Combo_eventService,
    private readonly _seatSectionService: Seat_sectionService,
  ) {}

  async createOrderItems(
    orderId: string,
    user: any,
    eventId: string,
    item: CreateOrderDetail,
  ) {
    // check combo info, check item combo
    const comboInfo = item?.combo_info;
    if (!Array.isArray(comboInfo)) {
      throw MessageCode.COMBO.COMBO_NOT_FOUND;
    }

    // Kiểm tra số ghế còn lại
    const booking: Record<string, number> = {};
    if (item.j_size) booking.J = item.j_size;
    if (item.q_size) booking.Q = item.q_size;
    if (item.k_size) booking.K = item.k_size;

    const checkSeat = await this._seatSectionService.getSizeSeat(eventId);

    const errors: string[] = [];

    for (const [key, value] of Object.entries(booking)) {
      const seatLeft = checkSeat[key] ?? 0;
      const diff = seatLeft - value; // Tính chênh lệch

      if (diff < 0) {
        const errorMsg = `❌ Ghế loại ${key} không đủ: Còn ${seatLeft} nhưng đặt ${value}`;
        console.log(errorMsg);
        errors.push(errorMsg);
      } else {
        console.log(`✅ Ghế loại ${key} OK: Còn ${seatLeft}, đặt ${value}`);
      }
    }

    if (errors.length > 0) {
      throw new ApiException({
        code: 'SEAT_ALREADY_BOOKED',
        message: errors.join('\n'), // Gộp lỗi lại thành một message
        status: HttpStatus.BAD_REQUEST,
      });
    }
    //

    const transformedData = comboInfo.map((combo) => ({
      comboId: combo.comboId,
      itemIds: combo.items.map((item) => StringUtils.ObjectId(item.itemId)),
      items: combo.items.map((item) => ({
        id: StringUtils.ObjectId(item.itemId),
        quantity: item.quantity,
      })),
    }));

    let sizeSeat = 0;

    for (const item of transformedData) {
      const checkItemsInCombo = await this._comboEventService.checkItemInCombo(
        item.comboId,
        item.itemIds,
      );
      if (checkItemsInCombo.length < 1) throw MessageCode.MENU.ITEM_NOT_FOUND;
      if (checkItemsInCombo[0].InfoMenuOrder.type !== MenuOrderType.COMBO)
        throw MessageCode.MENU.NOT_FOUND;
      let foodOrder = 0;
      let drinkOrder = 0;

      sizeSeat += checkItemsInCombo[0].size_seat;
      for (const value of item.items) {
        const info = checkItemsInCombo[0].InfoItem.find(
          (i) => String(i._id) == String(value.id),
        );
        if (info) {
          if (info.type == TypeItem.FOOD) {
            foodOrder += value.quantity;
          } else if (info.type == TypeItem.DRINK) {
            drinkOrder += value.quantity;
          }
        }
      }
      // check size food and drink
      // if (
      //   foodOrder > checkItemsInCombo[0].size_food ||
      //   drinkOrder > checkItemsInCombo[0].size_drink
      // ) {
      //   throw MessageCode.ORDERS.EXCEED_COMBO_LIMIT;
      // }
    }
    //

    // check time
    const jOrder = item.j_size ? true : false;
    const qOrder = item.q_size ? true : false;
    const kOrder = item.k_size ? true : false;
    const typeSeat = [];
    if (item.j_size) typeSeat.push('J');
    if (item.q_size) typeSeat.push('Q');
    if (item.k_size) typeSeat.push('K');

    // check seat
    const sizeSeatOrder =
      (item.j_size ?? 0) + (item.q_size ?? 0) + (item.k_size ?? 0);

    // if (sizeSeatOrder > sizeSeat) throw MessageCode.SEAT.INVALID_COMBO_QUANTITY;

    const dataSeat = await this._seatSectionService.getSeatListByCondition({
      event_id: eventId,
      type: { $in: typeSeat },
    });

    // Kiểm tra nếu user là khách mời
    // if (user?.guest?.is_guest == true) {
    //   if (jOrder) throw MessageCode.SEAT.INVALID_SEAT;
    // }
    if (dataSeat.length < 1) {
      throw MessageCode.SEAT.INVALID_SEAT;
    }

    for (const item of dataSeat) {
      await this.validateSeatBooking(user, item);
    }
    const object = item.combo_info.map((combo) => ({
      ...combo,
      comboId: StringUtils.ObjectId(combo.comboId), // ✅ Convert comboId
      items: combo.items.map((i) => ({
        ...i,
        itemId: StringUtils.ObjectId(i.itemId), // ✅ Convert itemId
      })),
    }));

    let objectUpSell: any;
    if (item.item_upsell) {
      objectUpSell = item.item_upsell.map((item) => ({
        ...item,
        itemId: StringUtils.ObjectId(item.itemId),
      }));
    }

    //
    const data = {
      _id: StringUtils.generateObjectId(),
      order_id: StringUtils.ObjectId(orderId),
      combo_info: object,
      ...(item.item_upsell && { item_upsell: objectUpSell }),
      ...(item.j_size && { j_size: item.j_size }),
      ...(item.q_size && { q_size: item.q_size }),
      ...(item.k_size && { k_size: item.k_size }),
    };

    return await this._order_detailRepo.createOrder_detail(data);
  }

  async deleteOrderDetail(orderId: string) {
    return await this._order_detailRepo.deleteByCondition({
      order_id: StringUtils.ObjectId(orderId),
    });
  }

  async validateSeatBooking(user: any, data: any) {
    const now = new Date();
    // if (now > new Date(data.time_end)) {
    //   throw MessageCode.SEAT.SEAT_EXPIRED;
    // }

    const kOpen = now >= new Date(data.k_booking_start);
    const qOpen = now >= new Date(data.q_booking_start);
    const jOpen = now >= new Date(data.j_booking_start);

    console.log(kOpen, qOpen, jOpen);

    // Nếu J chưa mở bán thì không ai mua được
    if (!kOpen) {
      throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET;
    }

    // Nếu là khách vãng lai thì cho qua
    if (user?.guest?.is_guest) {
      return;
    }

    const customerType =
      user?.customer_type === 'VIP'
        ? 'K'
        : ['Regular', 'Guest'].includes(user?.customer_type)
          ? 'J'
          : user?.customer_type;

    switch (customerType) {
      case 'K':
        return; // K mua được J, Q, K từ ngày 03/04/2025

      case 'Q':
        if (data.type === 'K' && !qOpen) {
          throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET; // K mở từ 04/04/2025
        }
        return; // Q được mua J, Q từ 03/04, K từ 04/04

      case 'J':
        if (data.type === 'K' && !jOpen) {
          throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET; // K mở từ 05/04/2025
        }
        if (data.type === 'Q' && !qOpen) {
          throw MessageCode.SEAT.SEAT_NOT_AVAILABLE_YET; // Q mở từ 04/04/2025
        }
        return; // J được mua J từ 03/04, Q từ 04/04, K từ 05/04
    }

    throw MessageCode.SEAT.SEAT_NOT_FOUND;
  }

  async updateOrderDetail(orderId, data: UpdateMenuFree) {

    const transformedData = data.combo_info.map((combo) => ({
      comboId: combo.comboId,
      itemIds: combo.items.map((item) => StringUtils.ObjectId(item.itemId)),
      items: combo.items.map((item) => ({
        id: StringUtils.ObjectId(item.itemId),
        quantity: item.quantity,
      })),
    }));

    for (const item of transformedData) {
      const checkItemsInCombo = await this._comboEventService.checkItemInCombo(
        item.comboId,
        item.itemIds,
      );
      if (checkItemsInCombo.length < 1) throw MessageCode.MENU.ITEM_NOT_FOUND;
      if (checkItemsInCombo[0].InfoMenuOrder.type !== MenuOrderType.COMBO)
        throw MessageCode.MENU.NOT_FOUND;
      let foodOrder = 0;
      let drinkOrder = 0;

      for (const value of item.items) {
        const info = checkItemsInCombo[0].InfoItem.find(
          (i) => String(i._id) == String(value.id),
        );
        if (info) {
          if (info.type == TypeItem.FOOD) {
            foodOrder += value.quantity;
          } else if (info.type == TypeItem.DRINK) {
            drinkOrder += value.quantity;
          }
        }
      }
      // check size food and drink
      if (
        foodOrder > checkItemsInCombo[0].size_food ||
        drinkOrder > checkItemsInCombo[0].size_drink
      ) {
        throw MessageCode.ORDERS.EXCEED_COMBO_LIMIT;
      }
    }

    const object = data.combo_info.map((combo) => ({
      ...combo,
      comboId: StringUtils.ObjectId(combo.comboId), // ✅ Convert comboId
      items: combo.items.map((i) => ({
        ...i,
        itemId: StringUtils.ObjectId(i.itemId), // ✅ Convert itemId
      })),
    }));

    const orderDetail = await this._order_detailRepo.findOrder_detailByCondition({order_id: StringUtils.ObjectId(orderId)})
    const combos = orderDetail.combo_info
    this.compareCombos(combos, object);
    return await this._order_detailRepo.updateOrder_detailByCondition({order_id: StringUtils.ObjectId(orderId)}, {combo_info: object});
  }

  compareCombos (combos: any[], object: any[]) {
    // Kiểm tra số lượng phần tử có khớp không
    if (combos.length !== object.length) {
      throw MessageCode.COMBO.COMBO_NOT_FOUND;
    }
  
    // Chuyển đổi dữ liệu về dạng chuẩn để so sánh
    const normalizeData = (arr: any[]) =>
      arr
        .map((item) => ({
          comboId: item.comboId.toString(), // Convert ObjectId thành string để so sánh
        }))
        .sort((a, b) => a.comboId.localeCompare(b.comboId)); // Sắp xếp để tránh khác thứ tự
  
    const normalizedCombos = normalizeData(combos);
    const normalizedObject = normalizeData(object);
  
    if (JSON.stringify(normalizedCombos) !== JSON.stringify(normalizedObject)) {
      throw MessageCode.COMBO.COMBO_NOT_FOUND;
    }
  };
}
