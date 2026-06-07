# Kế hoạch chuẩn bị ENV và Full Data Demo

## 1. Mục tiêu và đầu ra

Chỉ tập trung vào hai phần:

1. Bộ `.env` đầy đủ để backend, frontend và các tích hợp có thể chạy.
2. Bộ dữ liệu MongoDB hoàn chỉnh, có quan hệ đúng và đủ trạng thái để trình diễn.

Đầu ra cần lưu riêng, không commit secret:

```text
demo-package/
├── env/
│   ├── backend.env.test
│   ├── backend.env.product
│   └── frontend.env.local
├── database/
│   └── booking-demo.archive.gz
├── public/
│   └── uploads/...
└── DEMO_ACCOUNTS.md
```

Repository hiện không có seed script hoặc database dump sẵn. Vì vậy phải lấy lại database cũ rồi làm sạch, hoặc tự xây bộ seed mới.

## 2. Kiểm kê ENV đầy đủ

Backend chọn file theo `NODE_ENV`: không có giá trị thì đọc `.env`; `test` đọc `.env.test`; `product` đọc `.env.product`.

### 2.1 Backend ENV template

Tạo cả `backend/.env.test` và `backend/.env.product` từ template dưới đây. Không chép secret thật vào tài liệu hoặc Git.

```dotenv
# Runtime
NODE_ENV=test
TZ=Asia/Ho_Chi_Minh
TYPE=DEVELOPMENT
NAME_PROJECT=booking-demo

# MongoDB
MONGOURL=mongodb://<user>:<password>@<host>:27017
DATABASE=booking_demo

# Public URLs and redirects
FE_URI=http://localhost:3000
BE_URI=http://localhost:9000

# Telegram
TELEGRAM_ENABLED=false
TELEGRAM_TOKEN=<bot-token>
ID_GROUP_CHAT_TELE=<group-chat-id>
TELEGRAM_NOTIFY_ORDER=false
TELEGRAM_NOTIFY_CTV=false

# VNPay legacy configuration
VNP_TMNCODE=<vnpay-tmn-code>
VNP_HASHSECRET=<vnpay-hash-secret>
VNP_URL=<vnpay-payment-url>
VNP_API=<vnpay-api-url>
VNP_RETURNURL=http://localhost:9000/vnpay/return
```

`NODE_ENV` và `TZ` đang được code đọc nhưng thiếu trong các file env hiện tại. Sáu biến `VNP_*` đang có trong env cũ nhưng không được code hiện tại tham chiếu trực tiếp; vẫn giữ để phục vụ nhánh legacy hoặc khôi phục sau này.

### 2.2 Frontend ENV template

Ưu tiên tạo `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` được dùng cho REST API, Socket.IO, callback thanh toán demo và URL ảnh. `NEXT_PUBLIC_URL` được dùng cho referral link và chuyển trang sau thanh toán. Không thêm secret vào biến có tiền tố `NEXT_PUBLIC_` vì chúng được đưa xuống trình duyệt.

### 2.3 Chế độ demo đề xuất

- Thanh toán dùng mock local: tạo payment, chuyển qua callback demo và cập nhật trạng thái như luồng thật.
- OTP đăng ký dùng mock local, trả mã trong response và vẫn kiểm tra TTL 5 phút.
- Demo offline: đặt `TELEGRAM_ENABLED=false`.
- Demo đầy đủ: dùng credential test cho Telegram.
- Các URL callback trên dashboard nhà cung cấp phải khớp chính xác `BE_URI`; redirect người dùng phải khớp `FE_URI`.
- Thay mới toàn bộ credential cũ trước khi demo. Không tái sử dụng mật khẩu có trong source hoặc Docker Compose cũ.

## 3. Kế hoạch Full Data Demo

### 3.1 Danh mục dữ liệu tối thiểu

| Nhóm | Collection/model cần có | Bộ dữ liệu demo |
|---|---|---|
| Người dùng | `users`, `income`, `bank`, `membership_logs` | 1 ADMIN, 1 BOSS, 2 nhân viên, 6 khách gồm Regular/VIP/J/Q/K/Guest; mật khẩu demo cố định và referral chain hợp lệ |
| Thành viên | `membership_prices` | Đủ gói J, Q, K với giá, thời hạn và log mua gói |
| Sự kiện | `category_event`, `artists`, `events`, `content_event`, `showtimes` | Ít nhất 3 sự kiện: đang bán, sắp mở, đã kết thúc; 4 nghệ sĩ; nhiều suất diễn |
| Ghế | `seat_map`, `seat_section` | Sơ đồ ghế có Standard/Premium/VIP; ghế trống, đang giữ và đã bán |
| Menu | `category_item`, `menu_item`, `menu_order`, `combo_event` | Danh mục FOOD/DRINK, 10 món, menu COMBO/UPSALE, 3 combo có giá gốc và giá bán |
| Khuyến mãi | `promotion` | Mã giảm `%` và `VND`; áp dụng ALL/RANK/CTV/SPECIFIC; có mã ACTIVE, USED, LOCKED và hết hạn |
| Đơn hàng | `orders`, `order_seat`, `order_detail`, `payment` | Mỗi trạng thái PENDING, PAID, CONFIRMED, CANCELED, REFUNDED, FAILED có ít nhất 1 đơn |
| Nội dung phụ | `media`, `ticket`, `vnp_transactions` | Media đúng loại; ticket hỗ trợ đủ trạng thái; giao dịch VNPay chỉ cần nếu còn demo luồng legacy |

### 3.2 Quan hệ và thứ tự tạo dữ liệu

Tạo dữ liệu theo thứ tự để không phát sinh ID mồ côi:

1. `income` và `membership_prices`.
2. `users`, sau đó `bank` và `membership_logs`.
3. `category_event`, `artists`, `seat_map`.
4. `events` tham chiếu category và seat map.
5. `content_event`, `showtimes`, `seat_section` tham chiếu event.
6. `category_item`, `menu_item`, `menu_order`, `combo_event`.
7. `promotion` và danh sách user được áp dụng/đã sử dụng.
8. `orders`, sau đó `order_seat`, `order_detail`, `payment`.
9. `media`, `ticket` và giao dịch legacy nếu cần.

Mọi `_id`, `uid`, `event_id`, `showtimes_id`, `seat_id`, `order_id`, `menu_id`, `category_id` và danh sách user phải trỏ tới document tồn tại.

### 3.3 Ma trận tình huống demo bắt buộc

- Khách thường đặt vé Standard không dùng mã.
- Khách J/Q/K đặt vé đúng thời điểm mở bán theo hạng.
- Khách VIP mua combo và món upsell.
- CTV/referral tạo đơn và phát sinh điểm/hoa hồng.
- Voucher phần trăm, voucher số tiền, voucher sai hạng và voucher hết hạn.
- Đơn chờ thanh toán, thanh toán thành công, thất bại, hủy và hoàn tiền.
- Ghế đã bán không thể đặt lại; đơn giữ ghế pending tự hết hạn theo timer của backend.
- Admin xem khách hàng, sự kiện, đơn hàng, doanh thu và ticket hỗ trợ.

## 4. Media và tính toàn vẹn dữ liệu

Database chưa đủ nếu thiếu file ảnh. Phải sao lưu và khôi phục toàn bộ `backend/public/`, đặc biệt các đường dẫn được lưu trong `events.avatar`, `events.banner`, `artists.image`, `menu_item.image`, `menu_order.image`, `category_item.image` và `media.link`.

Kiểm tra:

- Không có đường dẫn ảnh bị 404.
- Ngày `showtimes`, `promotion.expired` và thời gian mở bán ghế được đẩy về thời điểm demo.
- Email, số điện thoại và giấy tờ cá nhân của khách thật được thay bằng dữ liệu giả.
- Không giữ token thanh toán, access token, IP hoặc thông tin ngân hàng thật trong dump.
- Tổng tiền order bằng tổng ghế, combo, món thêm và giảm giá; payment khớp order.

## 5. Cách đóng gói và reset

Sau khi dữ liệu đạt chuẩn:

```bash
mongodump \
  --uri="$MONGOURL" \
  --db="$DATABASE" \
  --archive=booking-demo.archive.gz \
  --gzip
```

Khôi phục trước mỗi buổi demo:

```bash
mongorestore \
  --uri="$MONGOURL" \
  --archive=booking-demo.archive.gz \
  --gzip \
  --drop
```

Sao lưu `backend/public/` cùng archive. Socket và OTP chỉ tồn tại trong process backend nên được làm sạch khi restart; timer order pending được phục hồi từ MongoDB theo `createdAt`.

## 6. Checklist nghiệm thu

- [ ] `backend/.env.test`, `backend/.env.product` và `frontend/.env.local` có đủ toàn bộ key trên.
- [ ] Credential sandbox còn hiệu lực; callback/redirect URL đã đăng ký đúng.
- [ ] MongoDB có đủ tất cả nhóm collection và không có reference mồ côi.
- [ ] Có đủ tài khoản, vai trò, hạng thành viên và thông tin đăng nhập demo.
- [ ] Có đủ sự kiện, lịch diễn, ghế, menu, combo, voucher và mọi trạng thái đơn.
- [ ] `backend/public/` đầy đủ và tất cả media tải được.
- [ ] Dữ liệu cá nhân/credential thật đã được loại bỏ.
- [ ] Có archive MongoDB sạch và bản sao media.
- [ ] Restore thử trên database trống thành công trước ngày demo.
