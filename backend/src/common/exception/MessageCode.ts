import { HttpStatus } from "@nestjs/common";
import { ApiException } from "./ApiException";

export const MessageCode = {
  USER: {
    NOT_FOUND: new ApiException({
      code: 'USER_NOT_FOUND',
      message: 'không tìm thấy user',
      status: HttpStatus.NO_CONTENT,
    }),
    INVALID_ROLE: new ApiException({
      code: 'INVALID_ROLE',
      message: 'bạn không có quyền',
      status: HttpStatus.FORBIDDEN,
    }),
    PHONE_IS_EXIST: new ApiException({
      code: 'PHONE_IS_EXIST',
      message: 'Số điện thoại đã được sử dụng',
      status: HttpStatus.CONFLICT,
    }),
    EMAIL_IS_EXIST: new ApiException({
      code: 'EMAIL_IS_EXIST',
      message: 'Email đã được sử dụng',
      status: HttpStatus.CONFLICT,
    }),
    PASSWORD_WRONG: new ApiException({
      code: 'PASSWORD_WRONG',
      message: 'Sai mật khẩu',
      status: HttpStatus.BAD_REQUEST,
    }),
    USERNAME_WRONG: new ApiException({
      code: 'USERNAME_WRONG',
      message: 'Sai tên đăng nhập',
      status: HttpStatus.BAD_REQUEST,
    }),
    INVALID_STATUS: new ApiException({
      code: 'INVALID_STATUS',
      message: 'Trạng thái không hợp lệ',
      status: HttpStatus.BAD_REQUEST,
    }),
    J_IS_DEFAULT: new ApiException({
      code: 'J_IS_DEFAULT',
      message: 'Trạng thái này là mặc định',
      status: HttpStatus.BAD_REQUEST,
    }),
    MEMBERSHIP_NOT_EXPIRED: new ApiException({
      code: 'MEMBERSHIP_NOT_EXPIRED',
      message: 'Hạng thẻ hiện tại chưa hết hạn và chưa khác với hạng thẻ cập nhật, không thể cập nhật',
      status: HttpStatus.BAD_REQUEST,
    })
  },
  
  ROLE: {
    ROLE_IS_EXIST: new ApiException({
      code: 'ROLE_IS_EXIST',
      message: 'Đã tồn tại Quyền',
      status: HttpStatus.CONFLICT,
    }),
    ROLE_IS_NOT_PERMISSION: new ApiException({
      code: 'ROLE_IS_NOT_PERMISSION',
      message: 'Người dùng không có Quyền',
      status: HttpStatus.FORBIDDEN,
    })
  },

  MENU: {
    INVALID_MENU_ITEM_PRICE: new ApiException({
      code: 'INVALID_MENU_ITEM_PRICE',
      message: 'Giá món ăn không hợp lệ',
      status: HttpStatus.BAD_REQUEST,
    }),
    ITEM_NOT_FOUND: new ApiException({
      code: 'ITEM_NOT_FOUND',
      message: 'không tìm thấy item',
      status: HttpStatus.BAD_REQUEST,
    }),
    NOT_FOUND: new ApiException({
      code: 'NOT_FOUND',
      message: 'không tìm thấy menu',
      status: HttpStatus.BAD_REQUEST,
    }),
    ITEM_NOT_FOUND_CUKCUK_ID: new ApiException({
      code: 'ITEM_NOT_FOUND_CUKCUK_ID',
      message: 'không tìm thấy item',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  REQUEST: {
    BAD_REQUEST: new ApiException({
      code: 'BAD_REQUEST',
      message: 'Yêu cầu không hợp lệ',
      status: HttpStatus.BAD_REQUEST,
    }),
    BAD_REQUEST_FOR_DATE: new ApiException({
      code: 'BAD_REQUEST_FOR_DATE',
      message: 'Ngày hết hạn không hợp lệ',
      status: HttpStatus.BAD_REQUEST,
  }),
    NOT_FOUND_TOKEN: new ApiException({
      code: 'NOT_FOUND_TOKEN',
      message: 'Không tìm thấy Token',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  TIME: {
    INVALID_TIME: new ApiException({
      code: 'INVALID_TIME',
      message: 'Thời gian đặt vé phải trước thời gian đặt vé thường',
      status: HttpStatus.BAD_REQUEST,
    }),
    OVERDUE_TIME: new ApiException({
      code: 'OVERDUE_TIME',
      message: 'Quá thời gian cho phép',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  POINT: {
    POINTS_NOT_ENOUGH: new ApiException({
      code: 'POINTS_NOT_ENOUGH',
      message: 'Không đủ điểm',
      status: HttpStatus.BAD_REQUEST,
    }),
    POINTS_NOT_FOUND: new ApiException({
      code: 'POINTS_NOT_FOUND',
      message: 'Không tìm thấy điểm',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  ARTISTS: {
    ARTISTS_NOT_FOUND: new ApiException({
      code: 'ARTISTS_NOT_FOUND',
      message: 'Không tìm thấy nhạc sĩ',
      status: HttpStatus.BAD_REQUEST,
    })
  },
  ORDERS: {
    ORDER_PAID: new ApiException({
      code: 'ORDER_PAID',
      message: 'Đơn hàng đã được thanh toán',
      status: HttpStatus.BAD_REQUEST,
    }),
    ORDER_NOT_FOUND: new ApiException({
      code: 'ORDER_NOT_FOUND',
      message: 'Không tìm thấy order',
      status: HttpStatus.BAD_REQUEST,
    }),
    EXCEED_COMBO_LIMIT: new ApiException({
      code: 'EXCEED_COMBO_LIMIT',
      message: 'Đặt quá số lượng combo',
      status: HttpStatus.BAD_REQUEST,
    }),
  },
  SEAT: {
    SEAT_NOT_FOUND: new ApiException({
      code: 'SEAT_NOT_FOUND',
      message: 'Không tìm thấy ghế',
      status: HttpStatus.BAD_REQUEST,
    }),
    SEAT_NOT_AVAILABLE_YET: new ApiException({
      code: 'SEAT_NOT_AVAILABLE_YET',
      message: 'Ghế chưa đến thời gian đặt',
      status: HttpStatus.BAD_REQUEST,
    }),
    SEAT_EXPIRED: new ApiException({
      code: 'SEAT_EXPIRED',
      message: 'Ghế đã quá hạn đặt',
      status: HttpStatus.BAD_REQUEST,
    }),
    SEAT_ALREADY_BOOKED: new ApiException({
      code: 'SEAT_ALREADY_BOOKED',
      message: 'Ghế đã được đặt trước đó',
      status: HttpStatus.BAD_REQUEST,
    }),
    INVALID_SEAT: new ApiException({
      code: 'INVALID_SEAT',
      message: 'Ghế không hợp lệ',
      status: HttpStatus.BAD_REQUEST,
    }),
    INVALID_COMBO_QUANTITY: new ApiException({
      code: 'INVALID_COMBO_QUANTITY',
      message: 'Số lượng ghế đặt vượt quá số lượng combo',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  PROMOTION: {
    PROMOTION_CODE_EXIST: new ApiException({
      code: 'PROMOTION_CODE_EXIST',
      message: 'Code đã tồn tại',
      status: HttpStatus.BAD_REQUEST,
    }),
    PROMOTION_NOT_FOUND: new ApiException({
      code: 'PROMOTION_NOT_FOUND',
      message: 'Không tìm thấy mã khuyến mãi',
      status: HttpStatus.BAD_REQUEST,
    }),
    PROMOTION_NOT_FOR_YOU: new ApiException({
      code: 'PROMOTION_NOT_FOR_YOU',
      message: 'Không phải dành cho bạn, bạn không đủ điều kiện sử dụng khuyến mãi này',
      status: HttpStatus.BAD_REQUEST,
    }),    
    PROMOTION_USED_UP: new ApiException({
      code: 'PROMOTION_USED_UP',
      message: 'Mã khuyến mãi đã hết lượt sử dụng',
      status: HttpStatus.BAD_REQUEST,
    }),
    PROMOTION_EXPIRED: new ApiException({
      code: 'PROMOTION_EXPIRED',
      message: 'Mã khuyến mãi đã hết hạn',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  EVENT: {
    SLUG_EVENT_EXIST: new ApiException({
      code: 'SLUG_EVENT_EXIST',
      message: 'Đường dẫn đã tồn tại',
      status: HttpStatus.BAD_REQUEST,
    }),
    EVENT_NOT_FOUND: new ApiException({
      code: 'EVENT_NOT_FOUND',
      message: 'Không tìm thấy sự kiện',
      status: HttpStatus.BAD_REQUEST,
    }),
    CREATE_ERROR: new ApiException({
      code: 'CREATE_ERROR',
      message: 'Lỗi tạo event',
      status: HttpStatus.BAD_REQUEST,
    }),
    EVENT_HAS_ORDER: new ApiException({
      code: 'EVENT_HAS_ORDER',
      message: 'Sự kiện đã có người đặt vé',
      status: HttpStatus.BAD_REQUEST,
    }),
    CUSTOM_TEXT_REQUIRED: new ApiException({
      code: 'CUSTOM_TEXT_REQUIRED',
      message: 'Text tùy ý là bắt buộc khi ẩn danh sách ca sỹ',
      status: HttpStatus.BAD_REQUEST,
    })
  },

  COMBO: {
    COMBO_NOT_FOUND: new ApiException({
      code: 'COMBO_NOT_FOUND',
      message: 'Không tìm thấy combo',
      status: HttpStatus.BAD_REQUEST,
    }),
  },

  USER_REQUEST: {
    "response": {
      "statusCode": 403,
      "message": "Forbidden resource",
      "error": "Forbidden"
    },
  },
}
