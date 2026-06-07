const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MARKER = 'booking-demo-v1';
const DEMO_PASSWORD = 'Demo@123';

function loadEnv(fileName) {
    const filePath = path.join(process.cwd(), fileName);
    const values = {};
    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
        const index = line.indexOf('=');
        if (index > 0 && !line.trim().startsWith('#')) {
            values[line.slice(0, index)] = line.slice(index + 1);
        }
    }
    return values;
}

const env = loadEnv(process.env.SEED_ENV || '.env.test');
if (env.DATABASE !== 'booking-demo') {
    throw new Error(
        `Refusing to seed DATABASE=${env.DATABASE}. Set DATABASE=booking-demo.`,
    );
}

const id = (group, index) =>
    new mongoose.Types.ObjectId(
        `${group.toString(16).padStart(6, '0')}${index
            .toString(16)
            .padStart(18, '0')}`,
    );
const days = (value) => new Date(Date.now() + value * 24 * 60 * 60 * 1000);
const hours = (value) => new Date(Date.now() + value * 60 * 60 * 1000);
const weekDate = (weekOffset, dayOffset, hour = 19) => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - daysSinceMonday + weekOffset * 7 + dayOffset,
            hour,
        ),
    );
};
const addHours = (date, value) =>
    new Date(date.getTime() + value * 60 * 60 * 1000);
const stamped = (documents) =>
    documents.map((document, index) => ({
        ...document,
        demoSeed: MARKER,
        createdAt: document.createdAt || days(-30 + index),
        updatedAt: new Date(),
    }));

const ids = {
    income: id(1, 1),
    users: Array.from({ length: 11 }, (_, i) => id(2, i + 1)),
    memberships: Array.from({ length: 3 }, (_, i) => id(3, i + 1)),
    categories: Array.from({ length: 3 }, (_, i) => id(4, i + 1)),
    artists: Array.from({ length: 4 }, (_, i) => id(5, i + 1)),
    seatMaps: Array.from({ length: 3 }, (_, i) => id(6, i + 1)),
    events: Array.from({ length: 3 }, (_, i) => id(7, i + 1)),
    showtimes: Array.from({ length: 4 }, (_, i) => id(8, i + 1)),
    itemCategories: Array.from({ length: 2 }, (_, i) => id(9, i + 1)),
    menuItems: Array.from({ length: 10 }, (_, i) => id(10, i + 1)),
    menuOrders: Array.from({ length: 3 }, (_, i) => id(11, i + 1)),
    combos: Array.from({ length: 3 }, (_, i) => id(12, i + 1)),
    promotions: Array.from({ length: 5 }, (_, i) => id(13, i + 1)),
    orders: Array.from({ length: 6 }, (_, i) => id(14, i + 1)),
};

const userSpecs = [
    ['Admin Demo', '0901000001', 'admin@booking.demo', 'ADMIN', 'VIP', 'ADMIN01'],
    ['Boss Demo', '0901000002', 'boss@booking.demo', 'BOSS', 'VIP', 'BOSS001'],
    ['Nhân viên Lan', '0901000003', 'lan@booking.demo', 'USER', 'Regular', 'STAFF01'],
    ['Nhân viên Minh', '0901000004', 'minh@booking.demo', 'USER', 'Regular', 'STAFF02'],
    ['Khách Regular', '0902000001', 'regular@booking.demo', 'USER', 'Regular', 'REGULAR'],
    ['Khách VIP', '0902000002', 'vip@booking.demo', 'USER', 'VIP', 'VIPDEMO'],
    ['Thành viên J', '0902000003', 'j@booking.demo', 'USER', 'J', 'MEMBERJ'],
    ['Thành viên Q', '0902000004', 'q@booking.demo', 'USER', 'Q', 'MEMBERQ'],
    ['Thành viên K', '0902000005', 'k@booking.demo', 'USER', 'K', 'MEMBERK'],
    ['Khách Guest', '0902000006', 'guest@booking.demo', 'USER', 'Guest', 'GUEST01'],
    ['CTV Demo', '0903000001', 'ctv@booking.demo', 'USER', 'VIP', 'CTVDEMO'],
];

const users = stamped(
    userSpecs.map(([name, phone, email, role, customerType, referral], index) => ({
        _id: ids.users[index],
        phone,
        name,
        email,
        password: DEMO_PASSWORD,
        address: 'Queen Acoustic, TP. Hồ Chí Minh',
        identity_number: `07920000${String(index + 1).padStart(4, '0')}`,
        role,
        state: 'OFFLINE',
        referral_code: referral,
        customer_type: customerType,
        customer_type_expiry:
            ['J', 'Q', 'K', 'VIP'].includes(customerType) ? days(180) : null,
        guest: customerType === 'Guest' ? { is_guest: true, expiry: days(30) } : undefined,
        incom_id: index === 10 ? ids.income : undefined,
        point: [5000, 3000, 100, 200, 1200, 5500, 2000, 3200, 4800, 50, 8900][index],
        isDelete: 'ACTIVE',
    })),
);

const seatRows = (prefix, count, booked = []) =>
    Array.from({ length: count }, (_, index) => ({
        name: `${prefix}${index + 1}`,
        id: `${prefix}${index + 1}`,
        cukcuk_id: `${prefix}.${index + 1}`,
        booked: booked.includes(index + 1),
    }));

const categoryEvents = stamped([
    { _id: ids.categories[0], name: 'Acoustic Night', slug: 'acoustic-night', status: 'ACTIVE' },
    { _id: ids.categories[1], name: 'Live Concert', slug: 'live-concert', status: 'ACTIVE' },
    { _id: ids.categories[2], name: 'Private Showcase', slug: 'private-showcase', status: 'ACTIVE' },
]);

const artists = stamped([
    {
        _id: ids.artists[0],
        name: 'Hà Nhi Demo',
        bio: 'Giọng ca ballad giàu cảm xúc, dữ liệu dành riêng cho trình diễn.',
        image: './public/uploads/demo/artists/ha-nhi-demo.jpg',
        link: 'ha-nhi-demo',
        slug: 'ha-nhi-demo',
    },
    {
        _id: ids.artists[1],
        name: 'Trung Quân Demo',
        bio: 'Nghệ sĩ khách mời cho đêm nhạc acoustic.',
        image: './public/uploads/demo/artists/anh-tu-demo.jpg',
        link: 'trung-quan-demo',
        slug: 'trung-quan-demo',
    },
    {
        _id: ids.artists[2],
        name: 'Ban nhạc Queen Demo',
        bio: 'Ban nhạc resident biểu diễn hàng tuần.',
        image: './public/uploads/demo/artists/queen-band-demo.jpg',
        link: 'queen-band-demo',
        slug: 'queen-band-demo',
    },
    {
        _id: ids.artists[3],
        name: 'Khách mời bí mật',
        bio: 'Nghệ sĩ dành cho sự kiện sắp mở bán.',
        image: './public/uploads/demo/artists/lam-bao-ngoc-demo.jpg',
        link: 'khach-moi-bi-mat',
        slug: 'khach-moi-bi-mat',
    },
]);

const seatMaps = stamped([
    { _id: ids.seatMaps[0], name: 'Sơ đồ Queen Hall', data_seat: { sections: ['VIP', 'Premium', 'Standard'] }, booked: false },
    { _id: ids.seatMaps[1], name: 'Sơ đồ Mini Stage', data_seat: { sections: ['Premium', 'Standard'] }, booked: false },
    { _id: ids.seatMaps[2], name: 'Sơ đồ Showcase', data_seat: { sections: ['VIP', 'Standard'] }, booked: true },
]);

const categoryItems = stamped([
    { _id: ids.itemCategories[0], code: 'DRINK', name: 'Đồ uống', image: './public/uploads/demo/menu/cocktail-pair.jpg' },
    { _id: ids.itemCategories[1], code: 'FOOD', name: 'Đồ ăn nhẹ', image: './public/uploads/demo/menu/fries.jpg' },
]);

const menuSpecs = [
    ['Trà đào cam sả', 'DRINK', 55000, 'Ly', './public/uploads/demo/menu/cocktail-orange.jpg'],
    ['Trà vải', 'DRINK', 50000, 'Ly', './public/uploads/demo/menu/fruit-tea.jpg'],
    ['Cà phê sữa', 'DRINK', 45000, 'Ly', './public/uploads/demo/menu/iced-coffee.jpg'],
    ['Nước ép cam', 'DRINK', 60000, 'Ly', './public/uploads/demo/menu/fruit-tea.jpg'],
    ['Mocktail Queen', 'DRINK', 75000, 'Ly', './public/uploads/demo/menu/cocktail-red.jpg'],
    ['Khoai tây chiên', 'FOOD', 65000, 'Phần', './public/uploads/demo/menu/fries.jpg'],
    ['Gà popcorn', 'FOOD', 85000, 'Phần', './public/uploads/demo/menu/food.jpg'],
    ['Pizza mini', 'FOOD', 120000, 'Phần', './public/uploads/demo/menu/pizza.jpg'],
    ['Hạt tổng hợp', 'FOOD', 45000, 'Phần', './public/uploads/demo/menu/food.jpg'],
    ['Trái cây theo mùa', 'FOOD', 95000, 'Phần', './public/uploads/demo/menu/fruit-tea.jpg'],
];
const menuItems = stamped(
    menuSpecs.map(([name, type, price, unit, image], index) => ({
        _id: ids.menuItems[index],
        name,
        desc: `${name} phục vụ tại sự kiện`,
        ingredient: type === 'DRINK' ? 'Nguyên liệu tươi, ít đường' : 'Chế biến trong ngày',
        flavor: [{ name: type === 'DRINK' ? 'Thanh mát' : 'Đậm vị', description: 'Hương vị đề xuất', icon: 'star', color: '#C9A227' }],
        category_id: type === 'DRINK' ? ids.itemCategories[0] : ids.itemCategories[1],
        type,
        unit,
        image,
        status: 'ACTIVE',
        price,
    })),
);

const menuOrders = stamped([
    {
        _id: ids.menuOrders[0],
        name: 'Combo Couple',
        description: 'Hai đồ uống và một món ăn nhẹ',
        type: 'COMBO',
        image: './public/uploads/demo/combos/couple.jpg',
        items: [ids.menuItems[0], ids.menuItems[1], ids.menuItems[5]],
        status: 'ACTIVE',
    },
    {
        _id: ids.menuOrders[1],
        name: 'Combo VIP',
        description: 'Mocktail, pizza và trái cây',
        type: 'COMBO',
        image: './public/uploads/demo/combos/premium-table.jpg',
        items: [ids.menuItems[4], ids.menuItems[7], ids.menuItems[9]],
        status: 'ACTIVE',
    },
    {
        _id: ids.menuOrders[2],
        name: 'Menu gọi thêm',
        description: 'Danh sách món upsell tại sự kiện',
        type: 'UPSALE',
        image: './public/uploads/demo/combos/upsell.jpg',
        items: ids.menuItems,
        status: 'ACTIVE',
    },
]);

const combos = stamped([
    { _id: ids.combos[0], name: 'Couple Standard', size_seat: 2, size_food: 1, size_drink: 2, price: 650000, price_origin: 720000, menu_id: ids.menuOrders[0], status: 'ACTIVE', is_show_upsell: true },
    { _id: ids.combos[1], name: 'VIP Experience', size_seat: 2, size_food: 2, size_drink: 2, price: 1100000, price_origin: 1250000, menu_id: ids.menuOrders[1], status: 'ACTIVE', is_show_upsell: true },
    { _id: ids.combos[2], name: 'Solo Premium', size_seat: 1, size_food: 1, size_drink: 1, price: 420000, price_origin: 470000, menu_id: ids.menuOrders[0], status: 'ACTIVE', is_show_upsell: false },
]);

const events = stamped([
    {
        _id: ids.events[0],
        title: 'Đêm Nhạc Chạm Vào Cảm Xúc',
        code: 'DEMO-LIVE-01',
        type_event: 'Offline',
        venue: 'Queen Acoustic, 85 Cách Mạng Tháng 8, TP.HCM',
        category_id: ids.categories[0],
        desc: 'Đêm nhạc đang mở bán với đầy đủ hạng ghế và combo.',
        avatar: './public/uploads/logo/FB7ACVLSR8_logo.png',
        banner: './public/uploads/demo/events/this-week.jpg',
        combo_ids: [ids.combos[0], ids.combos[1], ids.combos[2]],
        seat_map_id: ids.seatMaps[0],
        slug: 'dem-nhac-cham-vao-cam-xuc',
        status: 'ACTIVE',
        show_artists: true,
    },
    {
        _id: ids.events[1],
        title: 'Acoustic Cuối Tuần',
        code: 'DEMO-UPCOMING-02',
        type_event: 'Offline',
        venue: 'Queen Mini Stage, TP.HCM',
        category_id: ids.categories[1],
        desc: 'Sự kiện sắp mở bán dùng để demo lịch và quyền hạng thành viên.',
        avatar: './public/uploads/logo/FB7ACVLSR8_logo.png',
        banner: './public/uploads/demo/events/next-week.jpg',
        combo_ids: [ids.combos[0], ids.combos[2]],
        seat_map_id: ids.seatMaps[1],
        slug: 'acoustic-cuoi-tuan',
        status: 'ACTIVE',
        show_artists: true,
    },
    {
        _id: ids.events[2],
        title: 'Private Showcase: Ký Ức',
        code: 'DEMO-PAST-03',
        type_event: 'Offline',
        venue: 'Queen Private Room, TP.HCM',
        category_id: ids.categories[2],
        desc: 'Sự kiện đã kết thúc, dùng cho lịch sử đơn và báo cáo doanh thu.',
        avatar: './public/uploads/logo/FB7ACVLSR8_logo.png',
        banner: './public/uploads/demo/events/past-show.jpg',
        combo_ids: [ids.combos[1]],
        seat_map_id: ids.seatMaps[2],
        slug: 'private-showcase-ky-uc',
        status: 'ACTIVE',
        show_artists: true,
    },
]);

const showtimes = stamped([
    { _id: ids.showtimes[0], event_id: ids.events[0], time_start: weekDate(0, 4), time_end: addHours(weekDate(0, 4), 3) },
    { _id: ids.showtimes[1], event_id: ids.events[0], time_start: weekDate(0, 5), time_end: addHours(weekDate(0, 5), 3) },
    { _id: ids.showtimes[2], event_id: ids.events[1], time_start: weekDate(1, 5), time_end: addHours(weekDate(1, 5), 3) },
    { _id: ids.showtimes[3], event_id: ids.events[2], time_start: days(-30), time_end: new Date(days(-30).getTime() + 3 * 3600000) },
]);

const contentEvents = stamped([
    { _id: id(15, 1), event_id: ids.events[0], artist_id: ids.artists[0], desc: 'Main act', time: weekDate(0, 4), status: 'ACTIVE' },
    { _id: id(15, 2), event_id: ids.events[0], artist_id: ids.artists[1], desc: 'Guest act', time: weekDate(0, 4), status: 'ACTIVE' },
    { _id: id(15, 3), event_id: ids.events[1], artist_id: ids.artists[2], desc: 'Resident band', time: weekDate(1, 5), status: 'ACTIVE' },
    { _id: id(15, 4), event_id: ids.events[1], artist_id: ids.artists[3], desc: 'Secret guest', time: weekDate(1, 5), status: 'ACTIVE' },
    { _id: id(15, 5), event_id: ids.events[2], artist_id: ids.artists[0], desc: 'Past show', time: days(-30), status: 'ACTIVE' },
]);

const seatSections = stamped(
    events.flatMap((event, eventIndex) => {
        const mapId = ids.seatMaps[eventIndex];
        const end =
            eventIndex === 2
                ? days(-30)
                : eventIndex === 1
                  ? addHours(weekDate(1, 5), 3)
                  : addHours(weekDate(0, 5), 3);
        return [
            {
                _id: id(16 + eventIndex, 1),
                event_id: event._id,
                seat_id: mapId,
                size: 6,
                price: 450000,
                type: 'J',
                data_seat: seatRows('J', 6, eventIndex === 0 ? [1, 2] : eventIndex === 2 ? [1, 2, 3, 4] : []),
                j_booking_start: days(-10),
                q_booking_start: days(-8),
                k_booking_start: days(-6),
                g_booking_start: days(-4),
                time_end: end,
            },
            {
                _id: id(16 + eventIndex, 2),
                event_id: event._id,
                seat_id: mapId,
                size: 10,
                price: 320000,
                type: 'Q',
                data_seat: seatRows('Q', 10, eventIndex === 0 ? [1, 2, 3] : eventIndex === 2 ? [1, 2, 3, 4, 5] : []),
                j_booking_start: days(-10),
                q_booking_start: days(-8),
                k_booking_start: days(-6),
                g_booking_start: days(-4),
                time_end: end,
            },
            {
                _id: id(16 + eventIndex, 3),
                event_id: event._id,
                seat_id: mapId,
                size: 14,
                price: 220000,
                type: 'K',
                data_seat: seatRows('K', 14, eventIndex === 0 ? [1, 2, 3, 4] : eventIndex === 2 ? [1, 2, 3, 4, 5, 6] : []),
                j_booking_start: days(-10),
                q_booking_start: days(-8),
                k_booking_start: days(-6),
                g_booking_start: days(-4),
                time_end: end,
            },
        ];
    }),
);

const promotions = stamped([
    { _id: ids.promotions[0], code: 'DEMO10', name: 'Giảm 10%', desc: 'Áp dụng toàn bộ khách hàng', expired: days(90), status: 'ACTIVE', type_price: 'PERCENT', price: 10, required_points: 0, max_quantity: 100, total: 100, for: 'ALL', for_type: 'ALL', user_list: [], purchased_by: [], purchase_history: [] },
    { _id: ids.promotions[1], code: 'VIP100K', name: 'VIP giảm 100K', desc: 'Dành cho hạng VIP', expired: days(60), status: 'ACTIVE', type_price: 'VND', price: 100000, required_points: 0, max_quantity: 50, total: 50, for: 'VIP', for_type: 'Hạng thẻ', user_list: [], purchased_by: [], purchase_history: [] },
    { _id: ids.promotions[2], code: 'CTV15', name: 'CTV giảm 15%', desc: 'Mã dành cho cộng tác viên', expired: days(45), status: 'ACTIVE', type_price: 'PERCENT', price: 15, required_points: 500, max_quantity: 30, total: 30, for: 'CTV', for_type: 'CTV', uid: ids.users[10], user_list: [], purchased_by: [ids.users[10]], purchase_history: [{ ctv_id: ids.users[10], code: 'CTV15-001', purchase_date: days(-5), status: 'ACTIVE' }] },
    { _id: ids.promotions[3], code: 'EXPIRED50', name: 'Mã đã hết hạn', desc: 'Dùng demo validation', expired: days(-5), status: 'LOCKED', type_price: 'VND', price: 50000, required_points: 0, max_quantity: 10, total: 0, for: 'ALL', for_type: 'ALL', user_list: [], purchased_by: [], purchase_history: [] },
    { _id: ids.promotions[4], code: 'USED20', name: 'Mã đã sử dụng', desc: 'Dùng demo trạng thái USED', expired: days(30), status: 'USED', type_price: 'PERCENT', price: 20, required_points: 1000, max_quantity: 1, total: 0, for: 'SPECIFIC', for_type: 'Khách hàng cụ thể', user_list: [ids.users[5]], purchased_by: [ids.users[5]], purchase_history: [{ ctv_id: ids.users[10], code: 'USED20-001', purchase_date: days(-10), used_by: { user_id: ids.users[5], used_at: days(-2) }, status: 'USED' }] },
]);

const orderStatuses = ['PENDING', 'PAID', 'CONFIRMED', 'CANCELED', 'REFUNDED', 'FAILED'];
const orderUsers = [ids.users[4], ids.users[5], ids.users[6], ids.users[7], ids.users[8], ids.users[9]];
const orders = stamped(
    orderStatuses.map((status, index) => ({
        _id: ids.orders[index],
        uid: orderUsers[index],
        event_id: index >= 3 ? ids.events[2] : ids.events[0],
        showtimes_id: index >= 3 ? ids.showtimes[3] : ids.showtimes[0],
        employee_id: index === 2 ? ids.users[2] : undefined,
        code: `DEMO-ORDER-${String(index + 1).padStart(3, '0')}`,
        promotion: index === 1 ? { id: ids.promotions[0], code: 'DEMO10', discount: 10 } : undefined,
        total_price: [220000, 650000, 1100000, 320000, 450000, 220000][index],
        point_order: [22, 65, 110, 0, 0, 0][index],
        point_referred: index === 1 ? 30 : 0,
        note: `Đơn mẫu trạng thái ${status}`,
        referred_by: index === 1 ? 'CTVDEMO' : undefined,
        status,
        createdAt: index === 0 ? new Date() : days(-index * 3),
    })),
);

const orderSeats = stamped(
    orders.flatMap((order, index) => {
        const count = index === 1 || index === 2 ? 2 : 1;
        const prefix = index === 2 ? 'V' : index === 1 ? 'P' : 'S';
        const price = prefix === 'V' ? 450000 : prefix === 'P' ? 320000 : 220000;
        return Array.from({ length: count }, (_, seatIndex) => ({
            _id: id(20 + index, seatIndex + 1),
            order_id: order._id,
            price,
            seat_cukcuk_id: `${prefix}.${seatIndex + 1}`,
            seat_id: `${prefix}${seatIndex + 1}`,
            name_seat: `${prefix}${seatIndex + 1}`,
        }));
    }),
);

const comboItem = (menuIndex) => ({
    itemId: ids.menuItems[menuIndex],
    name: menuSpecs[menuIndex][0],
    type: menuSpecs[menuIndex][1],
    unit: menuSpecs[menuIndex][3],
    price: menuSpecs[menuIndex][2],
    image: menuSpecs[menuIndex][4],
});
const orderDetails = stamped(
    orders.map((order, index) => ({
        _id: id(30, index + 1),
        order_id: order._id,
        combo_info:
            index === 1 || index === 2
                ? [
                      {
                          comboId: index === 2 ? ids.combos[1] : ids.combos[0],
                          name: index === 2 ? 'VIP Experience' : 'Couple Standard',
                          price: index === 2 ? 1100000 : 650000,
                          size_seat: 2,
                          size_food: index === 2 ? 2 : 1,
                          size_drink: 2,
                          items:
                              index === 2
                                  ? [comboItem(4), comboItem(7), comboItem(9)]
                                  : [comboItem(0), comboItem(1), comboItem(5)],
                      },
                  ]
                : [],
        item_upsell: index === 1 ? [comboItem(6)] : [],
        j_size: index === 2 ? 1 : 0,
        q_size: index === 2 ? 1 : 0,
        k_size: 0,
    })),
);

const payments = stamped(
    orders.map((order, index) => ({
        _id: id(31, index + 1),
        order_id: order._id,
        uid: order.uid,
        payment_method: index === 2 ? 'CASH' : 'BANK_TRANSFER',
        status: order.status,
        note: `Thanh toán demo cho ${order.code}`,
        bankCode: index === 2 ? undefined : 'DEMO_BANK',
        txnRef: `DEMO-TXN-${String(index + 1).padStart(3, '0')}`,
        amount: order.total_price,
        responseCode: ['99', '00', '00', '24', '00', '99'][index],
        transactionStatus: order.status,
        payDate: days(-index).toISOString(),
        bankTranNo: `DEMO-BANK-${index + 1}`,
    })),
);

const dataByCollection = {
    incomes: stamped([{ _id: ids.income, name: 'Hoa hồng CTV', desc: 'Hoa hồng 10% trên đơn giới thiệu', type_price: 'PERCENT', price: 10 }]),
    membership_prices: stamped([
        { _id: ids.memberships[0], type: 'J', priceInMonth: 199000, duration: 'month' },
        { _id: ids.memberships[1], type: 'Q', priceInMonth: 399000, duration: 'month' },
        { _id: ids.memberships[2], type: 'K', priceInMonth: 699000, duration: 'month' },
    ]),
    users,
    banks: stamped([
        { _id: id(32, 1), uid: ids.users[10], bankCode: 'VCB', bankName: 'Vietcombank', accountNumber: '000012345678', accountHolderName: 'CTV DEMO' },
        { _id: id(32, 2), uid: ids.users[5], bankCode: 'MB', bankName: 'MB Bank', accountNumber: '000098765432', accountHolderName: 'KHACH VIP DEMO' },
    ]),
    membership_logs: stamped([
        { _id: id(33, 1), uid: ids.users[6], type: 'MEMBERSHIP', price: 199000 },
        { _id: id(33, 2), uid: ids.users[7], type: 'MEMBERSHIP', price: 399000 },
        { _id: id(33, 3), uid: ids.users[8], type: 'MEMBERSHIP', price: 699000 },
        { _id: id(33, 4), uid: ids.users[5], type: 'ORDER', price: 650000 },
    ]),
    category_events: categoryEvents,
    artists,
    seat_maps: seatMaps,
    events,
    content_events: contentEvents,
    showtimes,
    seat_sections: seatSections,
    category_items: categoryItems,
    menu_items: menuItems,
    menu_orders: menuOrders,
    combo_events: combos,
    promotions,
    orders,
    order_seats: orderSeats,
    order_details: orderDetails,
    payments,
    medias: stamped([
        { _id: id(34, 1), uid: ids.users[0], relative_id: ids.events[0], type: 'BANNER_EVENT', link: '/public/uploads/demo/events/this-week.jpg' },
        { _id: id(34, 2), uid: ids.users[0], relative_id: ids.artists[0], type: 'ARTIST', link: '/public/uploads/demo/artists/ha-nhi-demo.jpg' },
        { _id: id(34, 3), uid: ids.users[0], relative_id: ids.menuOrders[0], type: 'MENU_ORDER', link: '/public/uploads/demo/combos/couple.jpg' },
    ]),
    tickets: stamped([
        { _id: id(35, 1), uid: ids.users[4], type: 'SERVICE_SUPPORT', for: 'ADMIN', title: 'Hỗ trợ đổi vị trí ghế', price: 0, status: 'PENDING' },
        { _id: id(35, 2), uid: ids.users[10], type: 'COLLABORATOR', for: 'ADMIN', title: 'Yêu cầu rút hoa hồng tháng này', price: 500000, status: 'OPEN', handler_id: ids.users[0] },
        { _id: id(35, 3), uid: ids.users[5], type: 'COMPLAINTS', for: 'ADMIN', title: 'Phản hồi chất lượng dịch vụ', price: 0, status: 'COMPLETE', handler_id: ids.users[2] },
    ]),
    vnpaytransactions: stamped([
        { _id: id(36, 1), txnRef: 'DEMO-VNPAY-001', amount: 650000, orderId: ids.orders[1], userId: ids.users[5], bankCode: 'NCB', ipAddr: '127.0.0.1', responseCode: '00', transactionStatus: 'PAID', secureHash: 'demo-only', payDate: days(-3).toISOString(), bankTranNo: 'DEMO-VNP-001' },
    ]),
};

async function seed() {
    let lastError;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await mongoose.connect(env.MONGOURL, {
                dbName: env.DATABASE,
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 10000,
            });
            lastError = null;
            break;
        } catch (error) {
            lastError = error;
            console.warn(`MongoDB connection attempt ${attempt}/5 failed.`);
            await mongoose.disconnect().catch(() => undefined);
            if (attempt < 5) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
    if (lastError) {
        throw lastError;
    }

    const db = mongoose.connection.db;
    const results = [];

    for (const [collectionName, documents] of Object.entries(dataByCollection)) {
        const collection = db.collection(collectionName);
        await collection.deleteMany({ demoSeed: MARKER });
        if (documents.length) {
            await collection.insertMany(documents);
        }
        results.push([collectionName, documents.length]);
    }

    console.log(`Seeded ${env.DATABASE} with marker ${MARKER}`);
    for (const [name, count] of results) {
        console.log(`${name}: ${count}`);
    }
    console.log(`Demo password: ${DEMO_PASSWORD}`);
    await mongoose.disconnect();
}

seed().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
});
