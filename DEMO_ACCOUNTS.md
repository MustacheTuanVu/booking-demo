# Demo Accounts

Database: `booking-demo` trên MongoDB Atlas. Mọi tài khoản dùng mật khẩu:

```text
Demo@123
```

| Vai trò | Số điện thoại | Email | Mật khẩu |
|---|---|---|---|
| Admin | `0901000001` | `admin@booking.demo` | `Demo@123` |
| Boss | `0901000002` | `boss@booking.demo` | `Demo@123` |
| Nhân viên Lan | `0901000003` | `lan@booking.demo` | `Demo@123` |
| Nhân viên Minh | `0901000004` | `minh@booking.demo` | `Demo@123` |
| Khách Regular | `0902000001` | `regular@booking.demo` | `Demo@123` |
| Khách VIP | `0902000002` | `vip@booking.demo` | `Demo@123` |
| Thành viên J | `0902000003` | `j@booking.demo` | `Demo@123` |
| Thành viên Q | `0902000004` | `q@booking.demo` | `Demo@123` |
| Thành viên K | `0902000005` | `k@booking.demo` | `Demo@123` |
| Guest | `0902000006` | `guest@booking.demo` | `Demo@123` |
| CTV | `0903000001` | `ctv@booking.demo` | `Demo@123` |

## Reset Data

Chạy từ `backend/`:

```bash
npm run seed:demo
```

Script chỉ thay dữ liệu có marker `booking-demo-v1`, không drop database.

## Kịch bản nhanh

- Trang chủ: ba sự kiện đang bán, sắp diễn và đã kết thúc.
- Admin/Boss: khách hàng, nhân viên, sự kiện, menu, voucher, đơn và doanh thu.
- Khách VIP/J/Q/K: membership, voucher và lịch sử vé.
- CTV: referral `CTVDEMO`, đơn phát sinh hoa hồng và yêu cầu rút tiền.
- Đơn mẫu: đủ `PENDING`, `PAID`, `CONFIRMED`, `CANCELED`, `REFUNDED`, `FAILED`.
- Voucher: `DEMO10`, `VIP100K`, `CTV15`, `EXPIRED50`, `USED20`.
