# Phân tích Luồng Tạo Sự Kiện (Event Creation Flow)

## 📋 Tổng quan

Luồng tạo sự kiện trong hệ thống booking này khá phức tạp, bao gồm việc tạo đồng thời **4 entities chính**:
1. **Event** - Thông tin sự kiện
2. **Showtimes** - Các suất diễn
3. **Content_event** - Nội dung/nghệ sĩ
4. **Seat_section** - Cấu hình ghế ngồi

---

## 🎯 API Endpoint

```
POST /events/Create
Role: ADMIN, BOSS
```

---

## 📦 Request Body Structure (CreateEventDto)

```typescript
{
  // Thông tin cơ bản Event
  "title": "string",              // Tên sự kiện (3-50 ký tự)
  "type_event": "Offline",        // Enum: Online/Offline
  "venue": "string",              // Địa điểm
  "category_id": "ObjectId",      // ID danh mục
  "desc": "string",               // Mô tả (3-300 ký tự)
  "slug": "string",               // URL-friendly identifier
  "status": "ACTIVE",             // Enum: ACTIVE/INACTIVE/DRAFT
  
  // References
  "seat_map_id": "ObjectId",      // ID bản đồ ghế
  "combo_ids": ["ObjectId"],      // Danh sách combo IDs
  
  // Nested Data Arrays
  "showsTimeData": [              // Mảng các suất diễn
    {
      "time_start": "2024-01-01T10:00:00Z",
      "time_end": "2024-01-01T12:00:00Z"
    }
  ],
  
  "contentEventData": [           // Mảng nội dung/nghệ sĩ
    {
      "artist_id": "ObjectId",
      "desc": "string",
      "time": "2024-01-01T10:30:00Z",
      "status": "ACTIVE"
    }
  ],
  
  "seatSelectionData": [          // Mảng cấu hình ghế
    {
      "seat_id": "ObjectId",      // ID ghế trong seat_map
      "size": 100,                // Số lượng ghế
      "price": 200000,            // Giá vé
      "type": "J",                // Loại ghế: J/Q/K/G
      "data_seat": {},            // Dữ liệu cụ thể ghế
      "j_booking_start": "Date",  // Thời gian mở bán cho J
      "q_booking_start": "Date",
      "k_booking_start": "Date",
      "g_booking_start": "Date",
      "time_end": "Date"          // Thời gian đóng
    }
  ]
}
```

---

## 🔄 Luồng Xử Lý (Service Flow)

### **Step 1: Validation & Preparation**

```typescript
// 1.1. Generate Event ID
const idEvent = StringUtils.generateObjectId();

// 1.2. Check Slug Uniqueness
const slugData = await this._eventRepo.findEventByCondition({ slug: createEvent.slug });
if (slugData) {
  createEvent.slug = createEvent.slug + '-' + idEvent;
  throw MessageCode.EVENT.SLUG_EVENT_EXIST;
}

// 1.3. Validate Combo IDs
const foundItems = await this._comboEventService.findComboEventByManyId(createEvent.combo_ids);
if (foundItems.length !== createEvent.combo_ids.length) {
  throw MessageCode.COMBO.COMBO_NOT_FOUND;
}
```

### **Step 2: Prepare Event Data**

```typescript
const dataEvent = {
  _id: idEvent,
  title: createEvent.title,
  code: RandomCodeUtils.generateUniqueCode(10),  // Mã sự kiện ngẫu nhiên
  type_event: createEvent.type_event,
  venue: createEvent.venue,
  category_id: StringUtils.ObjectId(createEvent.category_id),
  desc: createEvent.desc,
  combo_ids: createEvent.combo_ids,
  seat_map_id: StringUtils.ObjectId(createEvent.seat_map_id),
  slug: createEvent.slug,
  status: createEvent.status
}
```

### **Step 3: Clone Nested Arrays**

```typescript
const showsTimeData = createEvent.showsTimeData.map(item => ({ ...item }));
const contentEventData = createEvent.contentEventData.map(item => ({ ...item }));
const seatSelectionData = createEvent.seatSelectionData.map(item => ({ ...item }));
```

### **Step 4: Sequential Creation with Rollback**

```typescript
try {
  // 4.1. Tạo Event chính
  const event = await this._eventRepo.createEvent(dataEvent);
  
  // 4.2. Tạo Showtimes (các suất diễn)
  const showtimes = await this._showTimeService.createManyShowtimes(
    event._id, 
    showsTimeData
  );
  
  // 4.3. Tạo Content_event (thông tin nghệ sĩ/nội dung)
  const content = await this._contentEventService.createManyContent_event(
    event._id, 
    contentEventData
  );
  
  // 4.4. Tạo Seat_section (cấu hình ghế ngồi)
  const seatSection = await this._seatSelectionService.createManySeat_section(
    event._id, 
    createEvent.seat_map_id, 
    seatSelectionData
  );
  
  return [event, showtimes, content, seatSection];
  
} catch (error) {
  // ROLLBACK: Xóa tất cả dữ liệu đã tạo nếu có lỗi
  console.error("Có lỗi, rollback dữ liệu...");
  await this._eventRepo.deleteEvent(idEvent);
  await this._showTimeService.deleteShowtimes(idEvent);
  await this._contentEventService.deleteContentEvent(idEvent);
  await this._seatSelectionService.deleteSeatSelection(idEvent);
  throw error;
}
```

---

## 🗄️ Database Schema Relationships

```
┌─────────────────┐
│     EVENT       │
│  - _id (PK)     │
│  - title        │
│  - code         │
│  - slug         │
│  - combo_ids[]  │◄────┐
│  - seat_map_id  │     │
└────────┬────────┘     │
         │              │
         │ (1)          │ (M)
         │              │
    ┌────┴──────────────┴─────────────┐
    │                                  │
    ▼ (1:N)                            ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ SHOWTIMES   │  │CONTENT_EVENT │  │ COMBO_EVENT  │
│  - event_id │  │  - event_id  │  │  - _id (PK)  │
│  - time_*   │  │  - artist_id │  │  - name      │
└─────────────┘  │  - desc      │  │  - price     │
                 └──────┬───────┘  └──────────────┘
                        │
                        │ (N:1)
                        ▼
                 ┌──────────────┐
                 │   ARTISTS    │
                 │  - _id (PK)  │
                 │  - name      │
                 └──────────────┘

    ┌─────────────┐
    │ SEAT_MAP    │
    │  - _id (PK) │
    │  - name     │
    │  - data_*   │
    └──────┬──────┘
           │ (1:N)
           ▼
    ┌─────────────────┐
    │ SEAT_SECTION    │
    │  - event_id (FK)│
    │  - seat_id (FK) │
    │  - size         │
    │  - price        │
    │  - type (J/Q/K) │
    └─────────────────┘
```

---

## 🔐 Business Rules

### 1. **Slug Uniqueness**
- Mỗi event phải có slug unique
- Nếu trùng → thêm suffix `{slug}-{eventId}`

### 2. **Combo Validation**
- Tất cả combo_ids phải tồn tại trong DB
- Nếu không đủ → throw error `COMBO_NOT_FOUND`

### 3. **Transaction-like Rollback**
- Nếu bất kỳ step nào fail → xóa toàn bộ data đã tạo
- Đảm bảo data consistency

### 4. **Seat Types**
- **J**: Loại ghế J (thường là VIP)
- **Q**: Loại ghế Q
- **K**: Loại ghế K (có giảm giá nếu đặt trước 3 ngày)
- **G**: Loại ghế G (Guest)

### 5. **Booking Start Times**
- Mỗi loại ghế có thời gian mở bán riêng
- `j_booking_start`, `q_booking_start`, `k_booking_start`, `g_booking_start`

---

## 📊 Response Structure

```typescript
[
  Event,           // Event document
  Showtimes[],     // Array of showtime documents
  Content_event[], // Array of content documents
  Seat_section[]   // Array of seat section documents
]
```

---

## ⚠️ Error Handling

| Error | Condition | Message |
|-------|-----------|---------|
| `SLUG_EVENT_EXIST` | Slug đã tồn tại | Slug này đã được sử dụng |
| `COMBO_NOT_FOUND` | Combo không tìm thấy | Một hoặc nhiều combo không tồn tại |
| `BAD_REQUEST` | Lỗi upload image | Yêu cầu không hợp lệ |
| Generic Error | Lỗi khi tạo data | Rollback và throw error |

---

## 🎨 Luồng Upload Images (Riêng biệt)

Images không được upload trong luồng create chính, mà có API riêng:

```
PUT /events/updateImages?eventId={id}
Content-Type: multipart/form-data

files[0] = logo (saved to FILE_UPLOAD_LOGO_EVENT)
files[1] = banner (saved to FILE_UPLOAD_BANNER_EVENT)
```

**Process:**
1. Validate event exists
2. Upload logo với tên: `{event.code}_logo.png`
3. Upload banner với tên: `{event.code}_banner.png`
4. Update event document với paths

---

## 🔍 Query & Aggregation

### Get Event với full info:
```javascript
// Aggregation pipeline joins:
// - showtimes (1:N)
// - content_events → artists (N:1)
// - combo_events (M:N)
// - seat_maps (1:1)
// - seat_sections (1:N)
```

### Filters hỗ trợ:
- `artist_id` - Lọc theo nghệ sĩ
- `time_from`, `time_to` - Lọc theo khoảng thời gian
- `query` - Text search (title hoặc artist name)
- `orderBy` - Sắp xếp (default: time_start desc)
- Pagination: `page`, `limit`

---

## 💡 Notes quan trọng

1. **Sequential Creation**: Không dùng `Promise.all()` để tránh race condition
2. **Manual Rollback**: Do MongoDB không có native transaction trong code này
3. **Slug Generation**: Auto-append eventId nếu trùng
4. **Code Generation**: Random 10-char unique code cho mỗi event
5. **Type Safety**: Dùng DTOs với class-validator và class-transformer
6. **Image Handling**: Tách riêng luồng upload để optimize

---

## 🚀 Flow Diagram

```
Client Request
    │
    ▼
[Validate DTO]
    │
    ▼
[Check Slug] ────► Exists? ─► Append ID
    │                           │
    │◄──────────────────────────┘
    ▼
[Validate Combos] ──► Not Found? ─► Throw Error
    │
    ▼
[Generate Event ID]
    │
    ▼
[Prepare Data]
    │
    ├──► [Create Event]
    │         │
    │         ▼
    ├──► [Create Showtimes]
    │         │
    │         ▼
    ├──► [Create Contents]
    │         │
    │         ▼
    └──► [Create Seat Sections]
              │
              ├──► Success ─► Return All Data
              │
              └──► Error ─► [ROLLBACK] ─► Delete All
```

---

## 📝 Example Request

```json
{
  "title": "Đêm Nhạc Acoustic",
  "type_event": "Offline",
  "venue": "Queen Acoustic - 123 Nguyễn Huệ, Q1",
  "category_id": "507f1f77bcf86cd799439011",
  "desc": "Đêm nhạc acoustic đặc biệt với các ca sĩ nổi tiếng",
  "slug": "dem-nhac-acoustic-2024",
  "status": "ACTIVE",
  "seat_map_id": "507f1f77bcf86cd799439012",
  "combo_ids": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "showsTimeData": [
    {
      "time_start": "2024-12-20T19:00:00Z",
      "time_end": "2024-12-20T22:00:00Z"
    }
  ],
  "contentEventData": [
    {
      "artist_id": "507f1f77bcf86cd799439015",
      "desc": "Trình diễn khai mạc",
      "time": "2024-12-20T19:30:00Z",
      "status": "ACTIVE"
    }
  ],
  "seatSelectionData": [
    {
      "seat_id": "507f1f77bcf86cd799439016",
      "size": 50,
      "price": 500000,
      "type": "J",
      "data_seat": {},
      "j_booking_start": "2024-12-10T00:00:00Z",
      "q_booking_start": "2024-12-12T00:00:00Z",
      "k_booking_start": "2024-12-15T00:00:00Z",
      "time_end": "2024-12-20T18:00:00Z"
    }
  ]
}
```

---

## 🔧 Update Flow

Update flow cho phép sửa từng phần riêng biệt:
- Event metadata
- Showtimes (update existing)
- Content_event (update existing)
- Seat_section (update existing)
- Images (separate endpoint)

Không có rollback mechanism trong update.

---

## 🗑️ Delete Flow

Delete event yêu cầu:
1. ✅ Check không có orders nào liên quan
2. ✅ Delete event document
3. ✅ Delete all showtimes
4. ✅ Delete all content_events
5. ✅ Delete all media files
6. ✅ Delete all seat_sections

Nếu có orders → throw `EVENT_HAS_ORDER`
