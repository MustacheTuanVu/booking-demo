# 🤖 HƯỚNG DẪN SETUP TELEGRAM BOT

> **Tình trạng**: ✅ Code đã implementation xong  
> **Cần làm**: Setup Telegram Bot và cấu hình environment variables

---

## 🎯 TỔNG QUAN

Hệ thống đã được tích hợp Telegram notification cho 2 sự kiện:
1. 💰 **Order thanh toán thành công**
2. 👥 **Yêu cầu đăng ký Cộng Tác Viên (CTV)**

---

## 📋 CÁC BƯỚC SETUP

### **BƯỚC 1: Tạo Telegram Bot**

1. Mở Telegram và tìm **@BotFather**
2. Gửi command: `/newbot`
3. Nhập tên bot (ví dụ: `Queen Acoustic Booking Bot`)
4. Nhập username bot (phải kết thúc bằng `bot`, ví dụ: `queen_booking_bot`)
5. Copy **Bot Token** được cung cấp
   - Format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - ⚠️ **LƯU Ý**: Giữ token này bí mật!

---

### **BƯỚC 2: Tạo Telegram Group và Lấy Chat ID**

1. Tạo group mới trong Telegram (hoặc dùng group có sẵn)
2. Thêm bot vào group:
   - Vào group settings → Add members
   - Tìm bot vừa tạo (@queen_booking_bot)
   - Thêm vào group
3. Gửi một message bất kỳ trong group
4. Lấy Chat ID:
   ```bash
   # Thay YOUR_BOT_TOKEN bằng token của bạn
   curl https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
5. Tìm trong response: `"chat":{"id": -1234567890,...}`
6. Copy số chat ID (bao gồm dấu `-`)

**Ví dụ response:**
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {...},
        "chat": {
          "id": -1001234567890,  // ← ĐÂY LÀ CHAT ID
          "title": "Admin Group",
          "type": "group"
        },
        "date": 1234567890,
        "text": "test"
      }
    }
  ]
}
```

---

### **BƯỚC 3: Cấu hình Environment Variables**

#### **File `.env.product` (Production)**

```env
# Telegram Bot Configuration
TELEGRAM_ENABLED=true
TELEGRAM_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
ID_GROUP_CHAT_TELE=-1001234567890
TELEGRAM_NOTIFY_ORDER=true
TELEGRAM_NOTIFY_CTV=true
```

#### **File `.env.test` (Testing)**

```env
# Telegram Bot Configuration (Test)
TELEGRAM_ENABLED=true
TELEGRAM_TOKEN=987654321:ZYXwvuTSRqponMLKjihGFEdcba
ID_GROUP_CHAT_TELE=-1009876543210
TELEGRAM_NOTIFY_ORDER=true
TELEGRAM_NOTIFY_CTV=true
```

#### **File `.env.development` (Local Development)**

```env
# Telegram Bot Configuration (Dev)
TELEGRAM_ENABLED=false  # ← Set false để không spam khi dev
TELEGRAM_TOKEN=
ID_GROUP_CHAT_TELE=
TELEGRAM_NOTIFY_ORDER=true
TELEGRAM_NOTIFY_CTV=true
```

**⚠️ LƯU Ý QUAN TRỌNG:**
- ✅ Production và Test nên dùng bot khác nhau
- ✅ Production và Test nên dùng group khác nhau
- ✅ Development set `TELEGRAM_ENABLED=false` để tránh spam
- ❌ **KHÔNG BAO GIỜ** commit token vào git

---

### **BƯỚC 4: Restart Service**

```bash
# Development
npm run start:dev

# Production
pm2 restart booking-api

# Hoặc với Docker
docker-compose restart
```

---

## ✅ KIỂM TRA SETUP

### **1. Kiểm tra status**

```bash
curl -X GET http://localhost:9000/system/telegram-status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response mong đợi:**
```json
{
  "enabled": true,
  "configured": true,
  "features": {
    "orderNotification": true,
    "ctvNotification": true
  },
  "timestamp": "2024-12-08T10:30:00.000Z"
}
```

### **2. Test gửi message**

```bash
curl -X GET http://localhost:9000/system/test-telegram \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Test message sent to Telegram group successfully",
  "timestamp": "2024-12-08T10:30:00.000Z"
}
```

**Kiểm tra Telegram group** → Bạn sẽ thấy message test!

---

## 🔧 TROUBLESHOOTING

### **Lỗi 1: "Telegram bot not initialized"**

**Nguyên nhân:**
- `TELEGRAM_ENABLED` không phải `true`
- `TELEGRAM_TOKEN` bị sai hoặc rỗng

**Giải pháp:**
```bash
# Kiểm tra .env
cat .env.product | grep TELEGRAM

# Đảm bảo:
TELEGRAM_ENABLED=true
TELEGRAM_TOKEN=<your_token>
```

---

### **Lỗi 2: "Chat not found"**

**Nguyên nhân:**
- Bot chưa được thêm vào group
- `ID_GROUP_CHAT_TELE` bị sai

**Giải pháp:**
1. Kiểm tra bot đã trong group chưa
2. Gửi lại message trong group
3. Lấy lại Chat ID bằng command curl
4. Update `.env` với Chat ID đúng

---

### **Lỗi 3: "Bot was blocked by the user"**

**Nguyên nhân:**
- Admin đã kick bot ra khỏi group

**Giải pháp:**
1. Thêm lại bot vào group
2. Test lại

---

### **Lỗi 4: "Unauthorized"**

**Nguyên nhân:**
- Bot token không hợp lệ hoặc hết hạn

**Giải pháp:**
1. Vào @BotFather
2. Gửi `/token`
3. Chọn bot
4. Lấy token mới
5. Update `.env`

---

## 📨 FORMAT MESSAGE MẪU

### **1. Order Success Notification**

```
🎉 ĐƠN HÀNG MỚI THANH TOÁN THÀNH CÔNG

📦 Mã đơn: ORDER_ABC123
💰 Tổng tiền: 500,000 VND
📅 Thời gian: 08/12/2024 14:30:25

👤 THÔNG TIN KHÁCH HÀNG
├─ Tên: Nguyễn Văn A
├─ SĐT: 0987654321
└─ Email: nguyenvana@gmail.com

🎫 CHI TIẾT ĐẶT CHỖ
├─ Event: Queen Acoustic Live Show
├─ Showtime: 20:00 - 10/12/2024
├─ Ghế: J: 2 | Q: 1 | K: 0
└─ Combo/Items: Combo Couple, Pepsi x2

💎 Điểm thưởng: +50 điểm
🎁 Khuyến mãi: GIAMGIA20 (-100,000 VND)

🔗 Chi tiết: https://booking.queenacoustic.vn/admin/orders/123

---
⏰ 08/12/2024 14:30:25
```

### **2. CTV Registration Notification**

```
👥 YÊU CẦU ĐĂNG KÝ CỘNG TÁC VIÊN MỚI

📋 Mã ticket: CTV_12345ABC
📝 Tiêu đề: Đăng ký làm cộng tác viên
📅 Thời gian: 08/12/2024 15:45:30

👤 THÔNG TIN NGƯỜI GỬI
├─ Tên: Trần Thị B
├─ SĐT: 0912345678
├─ Email: tranthib@gmail.com
└─ Điểm hiện tại: 1,250 điểm

⏳ Trạng thái: PENDING (Chờ duyệt)

🔗 Xem chi tiết: https://booking.queenacoustic.vn/admin/tickets/123

---
⏰ 08/12/2024 15:45:30
```

---

## 🎛️ FEATURE FLAGS

### **Tắt/Bật tính năng**

**Tắt hoàn toàn Telegram:**
```env
TELEGRAM_ENABLED=false
```

**Chỉ bật notification order:**
```env
TELEGRAM_ENABLED=true
TELEGRAM_NOTIFY_ORDER=true
TELEGRAM_NOTIFY_CTV=false
```

**Chỉ bật notification CTV:**
```env
TELEGRAM_ENABLED=true
TELEGRAM_NOTIFY_ORDER=false
TELEGRAM_NOTIFY_CTV=true
```

---

## 📊 MONITORING

### **Check logs**

```bash
# Development
# Logs sẽ hiển thị trong terminal

# Production với PM2
pm2 logs booking-api | grep Telegram

# Docker
docker logs booking-api | grep Telegram
```

**Logs mong đợi:**
```
✅ Telegram Bot initialized successfully
✅ Telegram message sent successfully
✅ Order notification sent for order: 123456
✅ CTV notification sent for ticket: 789012
```

**Logs lỗi:**
```
❌ Failed to initialize Telegram Bot: <error>
❌ Failed to send Telegram message: <error>
⚠️ Telegram bot not initialized - message skipped
```

---

## 🔐 SECURITY BEST PRACTICES

1. **Token Security**
   - ✅ Lưu token trong `.env`, không commit
   - ✅ Dùng token khác cho mỗi environment
   - ✅ Rotate token định kỳ (3-6 tháng)

2. **Group Security**
   - ✅ Chỉ admin được vào group
   - ✅ Bot chỉ có quyền send message
   - ✅ Enable group history cho new members: OFF

3. **Data Privacy**
   - ✅ Không gửi password, card number
   - ✅ Cân nhắc mask phone/email nếu cần
   - ✅ Tuân thủ GDPR/PDPA

---

## 📞 HỖ TRỢ

### **Nếu gặp vấn đề:**

1. Check logs trước tiên
2. Verify bot status: `GET /system/telegram-status`
3. Test connection: `GET /system/test-telegram`
4. Check Telegram API: `https://api.telegram.org/bot<TOKEN>/getMe`

### **Liên hệ:**
- Backend Team: backend@queenacoustic.vn
- DevOps: devops@queenacoustic.vn

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Đã tạo Telegram bot với @BotFather
- [ ] Đã lấy được Bot Token
- [ ] Đã tạo Telegram group cho admin
- [ ] Đã thêm bot vào group
- [ ] Đã lấy được Chat ID
- [ ] Đã update `.env.product` với token và chat ID
- [ ] Đã update `.env.test` với token và chat ID khác
- [ ] Đã restart service
- [ ] Test `/system/telegram-status` → success
- [ ] Test `/system/test-telegram` → nhận được message trong group
- [ ] Test thực tế: Tạo order → nhận notification
- [ ] Test thực tế: Đăng ký CTV → nhận notification
- [ ] Đã document cho team

---

**Last Updated**: 2024-12-08  
**Version**: 1.0.0  
**Status**: 🟢 READY TO USE
