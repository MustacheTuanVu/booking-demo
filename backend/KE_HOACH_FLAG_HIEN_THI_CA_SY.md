# Kế hoạch: Thêm Flag Ẩn/Hiện Danh Sách Ca Sỹ cho Slide FE

## 📋 Yêu cầu

**Thông tin hiển thị ở slide FE:**
- ✅ Thời gian (có sẵn: `InfoShowTimes`)
- ✅ Tên sự kiện (có sẵn: `title`)
- ✅ Mô tả (có sẵn: `desc`)
- 🆕 Danh sách ca sỹ (động: hiện list hoặc custom text)

**Logic mới:**
- **Case 1 - Hiện danh sách ca sỹ thật:**
  - Flag: `show_artists = true`
  - FE hiển thị: `InfoContents[].InfoArtist[]` (danh sách artists từ DB)
  - Không cần field `custom_artists_text`

- **Case 2 - Ẩn danh sách ca sỹ, hiện text tùy ý:**
  - Flag: `show_artists = false`
  - FE hiển thị: `custom_artists_text` (string do admin nhập)
  - Ví dụ: "Nhiều nghệ sỹ nổi tiếng", "Guest artists", "Coming soon"

---

## 🎯 Solution Overview

### Thêm 2 fields mới vào Event Schema:

```typescript
{
  show_artists: boolean,        // Default: true (hiển thị artists)
  custom_artists_text: string   // Optional, chỉ dùng khi show_artists = false
}
```

### Frontend Logic:

```javascript
if (event.show_artists === true) {
  // Hiển thị danh sách artists thật
  displayArtists(event.InfoContents.map(c => c.InfoArtist.name).join(', '));
} else {
  // Hiển thị custom text
  displayArtists(event.custom_artists_text);
}
```

---

## 📦 Files cần sửa

### 1. **Schema: `src/events/schema/events.schema.ts`**

**Thêm 2 properties:**

```typescript
@Prop({ required: false, type: Boolean, default: true })
show_artists: boolean;

@Prop({ required: false, type: String })
custom_artists_text: string;
```

**Position:** Sau field `status`

---

### 2. **DTO Create: `src/events/dto/create.dto.ts`**

**Thêm 2 fields với validation:**

```typescript
@ApiProperty({
    description: 'Flag để hiển thị danh sách ca sỹ thật hay custom text',
    type: Boolean,
    default: true,
    required: false
})
@IsOptional()
@IsBoolean()
show_artists?: boolean;

@ApiProperty({
    description: 'Text tùy ý hiển thị thay vì danh sách ca sỹ (chỉ dùng khi show_artists = false)',
    type: String,
    required: false,
    example: 'Nhiều nghệ sỹ nổi tiếng'
})
@IsOptional()
@IsString()
@Length(0, 200)
custom_artists_text?: string;
```

**Validation Logic:** Sẽ validate trong Service layer

---

### 3. **DTO Update: `src/events/dto/update.dto.ts`**

**Thêm 2 fields tương tự Create:**

```typescript
@ApiProperty({
    description: 'Flag để hiển thị danh sách ca sỹ thật hay custom text',
    type: Boolean,
    required: false
})
@IsOptional()
@IsBoolean()
show_artists?: boolean;

@ApiProperty({
    description: 'Text tùy ý hiển thị thay vì danh sách ca sỹ',
    type: String,
    required: false
})
@IsOptional()
@IsString()
@Length(0, 200)
custom_artists_text?: string;
```

---

### 4. **Service: `src/events/events.service.ts`**

#### 4.1. Update method `createEvent()`

**Thêm validation:**

```typescript
// Validation: Nếu show_artists = false thì custom_artists_text là required
if (createEvent.show_artists === false && !createEvent.custom_artists_text) {
    throw MessageCode.EVENT.CUSTOM_TEXT_REQUIRED;
}

// Nếu show_artists = true hoặc undefined thì set default
const showArtists = createEvent.show_artists !== false; // default true
```

**Update dataEvent object:**

```typescript
const dataEvent = {
    _id: idEvent,
    title: createEvent.title,
    code: RandomCodeUtils.generateUniqueCode(10),
    type_event: createEvent.type_event,
    venue: createEvent.venue,
    category_id: StringUtils.ObjectId(createEvent.category_id),
    desc: createEvent.desc,
    combo_ids: createEvent.combo_ids,
    seat_map_id: StringUtils.ObjectId(createEvent.seat_map_id),
    slug: createEvent.slug,
    status: createEvent.status,
    show_artists: showArtists,                                        // 🆕
    custom_artists_text: createEvent.custom_artists_text || null      // 🆕
}
```

#### 4.2. Update method `updateEvent()`

**Thêm validation:**

```typescript
// Validation cho update
if (updateEvent.show_artists === false && !updateEvent.custom_artists_text) {
    // Kiểm tra xem event hiện tại có custom_artists_text chưa
    const currentEvent = await this._eventRepo.findEventById(idEvent);
    if (!currentEvent.custom_artists_text) {
        throw MessageCode.EVENT.CUSTOM_TEXT_REQUIRED;
    }
}
```

**Update dataEvent object:**

```typescript
const dataEvent = {
    ...(updateEvent.title && { title: updateEvent.title }),
    ...(updateEvent.type_event && { type_event: updateEvent.type_event }),
    ...(updateEvent.venue && { venue: updateEvent.venue }),
    ...(updateEvent.category_id && { category_id: StringUtils.ObjectId(updateEvent.category_id) }),
    ...(updateEvent.desc && { desc: updateEvent.desc }),
    ...(updateEvent.seat_map_id && { seat_map_id: StringUtils.ObjectId(updateEvent.seat_map_id) }),
    ...(updateEvent.slug && { slug: updateEvent.slug }),
    ...(updateEvent.status && { status: updateEvent.status }),
    ...(updateEvent.show_artists !== undefined && { show_artists: updateEvent.show_artists }),           // 🆕
    ...(updateEvent.custom_artists_text !== undefined && { custom_artists_text: updateEvent.custom_artists_text })  // 🆕
}
```

---

### 5. **Repository: `src/events/events.repo.ts`**

#### 5.1. Update `getEventByPaging()` - Aggregation $group stage

**Thêm 2 fields vào $group:**

```typescript
{
    $group: {
        _id: '$_id',
        title: {$first: '$title'},
        code: {$first: '$code'},
        type_event: {$first: '$type_event'},
        venue: {$first: '$venue'},
        category_id: {$first: '$category_id'},
        desc: {$first: '$desc'},
        seat_map_id: {$first: '$seat_map_id'},
        slug: {$first: '$slug'},
        status: {$first: '$status'},
        show_artists: {$first: '$show_artists'},                    // 🆕
        custom_artists_text: {$first: '$custom_artists_text'},      // 🆕
        createdAt: {$first: '$updatedAt'},
        updatedAt: {$first: '$updatedAt'},
        avatar: {$first: '$avatar'},
        banner: {$first: '$banner'},
        InfoShowTimes: {$first: '$InfoShowTimes'},
        InfoContents: {$push: '$InfoContents'},
        InfoCombos : {$first: '$InfoCombos'},
    }
}
```

**Vị trí:** Có **2 chỗ $group** trong pipeline (1 cho data, 1 cho count) → update cả 2

#### 5.2. Update `getDetailEvent()` - Aggregation $group stage

**Thêm 2 fields vào $group:**

```typescript
{
    $group: {
        _id: '$_id',
        title: {$first: '$title'},
        code: {$first: '$code'},
        type_event: {$first: '$type_event'},
        venue: {$first: '$venue'},
        category_id: {$first: '$category_id'},
        desc: {$first: '$desc'},
        seat_map_id: {$first: '$seat_map_id'},
        slug: {$first: '$slug'},
        status: {$first: '$status'},
        show_artists: {$first: '$show_artists'},                    // 🆕
        custom_artists_text: {$first: '$custom_artists_text'},      // 🆕
        createdAt: {$first: '$updatedAt'},
        updatedAt: {$first: '$updatedAt'},
        avatar: {$first: '$avatar'},
        banner: {$first: '$banner'},
        InfoShowTimes: {$first: '$InfoShowTimes'},
        InfoContents: {$push: '$InfoContents'},
        InfoCombos: {$first: '$InfoCombos'},
    }
}
```

#### 5.3. Update `getDetailEventBySlug()` - Aggregation $group stage

**Thêm 2 fields vào $group tương tự:**

```typescript
show_artists: {$first: '$show_artists'},                    // 🆕
custom_artists_text: {$first: '$custom_artists_text'},      // 🆕
```

---

### 6. **Message Code: `src/common/exception/MessageCode.ts`**

**Thêm error code mới:**

```typescript
export const MessageCode = {
    EVENT: {
        // ... existing codes
        CUSTOM_TEXT_REQUIRED: {
            code: 'EVENT_004',
            message: 'Custom artists text is required when show_artists is false',
            statusCode: 400
        }
    }
}
```

**Note:** Cần check file MessageCode thực tế để thêm đúng format

---

## 📊 Database Migration (Optional)

### Nếu muốn set default cho events cũ:

```javascript
db.events.updateMany(
    { show_artists: { $exists: false } },
    { 
        $set: { 
            show_artists: true,
            custom_artists_text: null
        } 
    }
)
```

**Note:** Không bắt buộc vì schema đã có `default: true`

---

## 🧪 Test Cases

### 1. **Create Event - Case 1: Hiện artists (default)**

**Request:**
```json
{
  "title": "Đêm nhạc acoustic",
  "desc": "Đêm nhạc tuyệt vời",
  "show_artists": true,  // hoặc không gửi (default true)
  // không cần custom_artists_text
  ...
}
```

**Expected:** ✅ Success, `show_artists = true`, `custom_artists_text = null`

---

### 2. **Create Event - Case 2: Ẩn artists, có custom text**

**Request:**
```json
{
  "title": "Đêm nhạc acoustic",
  "desc": "Đêm nhạc tuyệt vời",
  "show_artists": false,
  "custom_artists_text": "Nhiều nghệ sỹ nổi tiếng",
  ...
}
```

**Expected:** ✅ Success, `show_artists = false`, `custom_artists_text = "Nhiều nghệ sỹ nổi tiếng"`

---

### 3. **Create Event - Case 3: Ẩn artists, KHÔNG có custom text**

**Request:**
```json
{
  "title": "Đêm nhạc acoustic",
  "desc": "Đêm nhạc tuyệt vời",
  "show_artists": false,
  // THIẾU custom_artists_text
  ...
}
```

**Expected:** ❌ Error 400 - `CUSTOM_TEXT_REQUIRED`

---

### 4. **Update Event - Toggle show_artists**

**Request:**
```json
{
  "show_artists": false,
  "custom_artists_text": "Guest artists"
}
```

**Expected:** ✅ Success, toggle từ true → false

---

### 5. **Get Event - Response structure**

**Response:**
```json
{
  "_id": "...",
  "title": "Đêm nhạc acoustic",
  "desc": "...",
  "show_artists": false,
  "custom_artists_text": "Nhiều nghệ sỹ nổi tiếng",
  "InfoShowTimes": [...],
  "InfoContents": [
    {
      "artist_id": "...",
      "InfoArtist": {
        "name": "Trịnh Công Sơn"
      }
    }
  ]
}
```

**Frontend logic:**
```javascript
const artistsDisplay = event.show_artists 
  ? event.InfoContents.map(c => c.InfoArtist.name).join(', ')
  : event.custom_artists_text;
```

---

## 🔍 Validation Summary

| Condition | show_artists | custom_artists_text | Result |
|-----------|--------------|---------------------|--------|
| Default | `true` | `null` hoặc không gửi | ✅ Valid - Hiện artists |
| Explicit hiện | `true` | Có hoặc không | ✅ Valid - Hiện artists (ignore custom_text) |
| Ẩn + có text | `false` | `"Some text"` | ✅ Valid - Hiện custom text |
| Ẩn + không text | `false` | `null` hoặc không gửi | ❌ Error - `CUSTOM_TEXT_REQUIRED` |

---

## 📱 Frontend Display Logic

### Component Slide (Pseudo-code):

```tsx
function EventSlide({ event }) {
  const displayArtists = () => {
    if (event.show_artists) {
      // Lấy danh sách artists thật
      const artists = event.InfoContents
        .map(content => content.InfoArtist.name)
        .join(', ');
      return artists || 'Chưa có ca sỹ';
    } else {
      // Hiển thị custom text
      return event.custom_artists_text || 'N/A';
    }
  };

  return (
    <div className="event-slide">
      <h2>{event.title}</h2>
      <p>{event.desc}</p>
      <div className="time">
        {formatDate(event.InfoShowTimes[0].time_start)}
      </div>
      <div className="artists">
        <strong>Ca sỹ:</strong> {displayArtists()}
      </div>
    </div>
  );
}
```

---

## 🎨 Admin UI Suggestion

### Form tạo/sửa Event:

```
┌────────────────────────────────────┐
│ Event Information                  │
├────────────────────────────────────┤
│ Title: [________________]          │
│ Description: [_____________]       │
│                                    │
│ ☑ Hiển thị danh sách ca sỹ        │ ← Checkbox show_artists
│                                    │
│ Hoặc nhập text tùy ý:             │
│ [_________________________]        │ ← Input custom_artists_text
│ (Chỉ dùng khi không hiện ca sỹ)  │ ← Disabled khi checkbox checked
│                                    │
│ [Lưu] [Hủy]                       │
└────────────────────────────────────┘
```

**Logic:**
- Khi checkbox ON → disable input text
- Khi checkbox OFF → enable & require input text

---

## 🚀 Implementation Order

1. ✅ Update Schema (`events.schema.ts`)
2. ✅ Update DTOs (`create.dto.ts`, `update.dto.ts`)
3. ✅ Add Message Code (`MessageCode.ts`)
4. ✅ Update Service Logic (`events.service.ts`)
   - Validation trong createEvent
   - Validation trong updateEvent
5. ✅ Update Repository Aggregations (`events.repo.ts`)
   - getEventByPaging (2 chỗ $group)
   - getDetailEvent
   - getDetailEventBySlug
6. ✅ Test APIs với Swagger/Postman
7. ✅ (Optional) Run migration script cho events cũ

---

## 📝 Notes quan trọng

### 1. **Backward Compatibility:**
- Events cũ sẽ có `show_artists = true` (default)
- `custom_artists_text = null`
- FE sẽ hiển thị danh sách artists như cũ → không break

### 2. **Default Behavior:**
- Nếu không gửi `show_artists` trong request → mặc định `true`
- Giữ nguyên hành vi hiện tại → safe

### 3. **Field Lengths:**
- `custom_artists_text`: Max 200 characters
- Có thể adjust nếu cần dài hơn

### 4. **Conditional Logic:**
- Nếu `show_artists = true` → FE IGNORE `custom_artists_text`
- Chỉ dùng `custom_artists_text` khi `show_artists = false`

### 5. **Empty Custom Text:**
- Nếu admin muốn ẩn artists VÀ không hiện gì → có thể cho phép empty string
- Hiện tại: REQUIRED khi `show_artists = false`
- Có thể thảo luận lại nếu cần flexible hơn

---

## ⚠️ Edge Cases cần xử lý

### Case 1: Event không có artists nào trong InfoContents
```javascript
// Nếu show_artists = true nhưng InfoContents = []
if (event.show_artists && event.InfoContents.length === 0) {
  displayArtists = 'Chưa có ca sỹ';
}
```

### Case 2: Update từ false → true
```javascript
// Admin toggle từ ẩn → hiện
// custom_artists_text có thể giữ lại hoặc set null
// Không cần validate custom_artists_text khi chuyển sang true
```

### Case 3: Custom text quá dài
- Validation max 200 chars trong DTO
- FE có thể truncate nếu cần: `"Text quá dài..."`

---

## 🎯 Summary

**Thêm 2 fields đơn giản nhưng linh hoạt:**
- `show_artists`: boolean flag
- `custom_artists_text`: string tùy ý

**Ưu điểm:**
- ✅ Không breaking change (default true)
- ✅ Linh hoạt cho admin
- ✅ Logic đơn giản cho FE
- ✅ Có validation chặt chẽ

**Files cần sửa:**
- 1 Schema
- 2 DTOs
- 1 Service (2 methods)
- 1 Repo (3 methods, 5 chỗ $group)
- 1 Message Code

**Estimate:** ~1-2 hours coding + testing
