export enum OrderStatus {
    PENDING = 'PENDING', // Đang chờ thanh toán
    PAID = 'PAID', // Đã thanh toán
    CONFIRMED = 'CONFIRMED', // Đã xác nhận
    CANCELED = 'CANCELED', // Đã hủy
    REFUNDED = 'REFUNDED', // Đã hoàn tiền,
    FAILED = 'FAILED'
  }
  