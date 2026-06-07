const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MARKER = 'booking-demo-v1';
const DEMO_PASSWORD = 'Demo@123';

const expectedCounts = {
    incomes: 1,
    membership_prices: 3,
    users: 11,
    banks: 2,
    membership_logs: 4,
    category_events: 3,
    artists: 4,
    seat_maps: 3,
    events: 3,
    content_events: 5,
    showtimes: 4,
    seat_sections: 9,
    category_items: 2,
    menu_items: 10,
    menu_orders: 3,
    combo_events: 3,
    promotions: 5,
    orders: 6,
    order_seats: 8,
    order_details: 6,
    payments: 6,
    medias: 3,
    tickets: 3,
    vnpaytransactions: 1,
};

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

async function connect(env) {
    let lastError;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await mongoose.connect(env.MONGOURL, {
                dbName: env.DATABASE,
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 10000,
            });
            return;
        } catch (error) {
            lastError = error;
            console.warn(`MongoDB connection attempt ${attempt}/5 failed.`);
            await mongoose.disconnect().catch(() => undefined);
            if (attempt < 5) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
    throw lastError;
}

async function countBrokenReferences(db, source, field, target) {
    const rows = await db
        .collection(source)
        .aggregate([
            { $match: { demoSeed: MARKER } },
            {
                $lookup: {
                    from: target,
                    localField: field,
                    foreignField: '_id',
                    as: 'target',
                },
            },
            { $match: { target: { $size: 0 } } },
            { $count: 'total' },
        ])
        .toArray();
    return rows[0]?.total || 0;
}

async function verify() {
    const env = loadEnv(process.env.SEED_ENV || '.env.test');
    if (env.DATABASE !== 'booking-demo') {
        throw new Error(
            `Refusing to verify DATABASE=${env.DATABASE}. Set DATABASE=booking-demo.`,
        );
    }

    await connect(env);
    const db = mongoose.connection.db;
    const errors = [];

    for (const [collectionName, expected] of Object.entries(expectedCounts)) {
        const actual = await db
            .collection(collectionName)
            .countDocuments({ demoSeed: MARKER });
        if (actual !== expected) {
            errors.push(`${collectionName}: expected ${expected}, found ${actual}`);
        }
    }

    const admin = await db.collection('users').findOne({
        demoSeed: MARKER,
        phone: '0901000001',
        email: 'admin@booking.demo',
    });
    if (!admin || admin.password !== DEMO_PASSWORD || admin.role !== 'ADMIN') {
        errors.push('Admin demo account is missing or has invalid credentials.');
    }

    const statuses = await db
        .collection('orders')
        .distinct('status', { demoSeed: MARKER });
    const expectedStatuses = [
        'PENDING',
        'PAID',
        'CONFIRMED',
        'CANCELED',
        'REFUNDED',
        'FAILED',
    ];
    for (const status of expectedStatuses) {
        if (!statuses.includes(status)) {
            errors.push(`Missing order status: ${status}`);
        }
    }

    const references = [
        ['orders', 'uid', 'users'],
        ['orders', 'event_id', 'events'],
        ['orders', 'showtimes_id', 'showtimes'],
        ['showtimes', 'event_id', 'events'],
        ['content_events', 'event_id', 'events'],
        ['content_events', 'artist_id', 'artists'],
        ['seat_sections', 'event_id', 'events'],
        ['payments', 'order_id', 'orders'],
        ['order_seats', 'order_id', 'orders'],
        ['order_details', 'order_id', 'orders'],
        ['banks', 'uid', 'users'],
        ['membership_logs', 'uid', 'users'],
    ];

    for (const [source, field, target] of references) {
        const broken = await countBrokenReferences(db, source, field, target);
        if (broken) {
            errors.push(`${source}.${field} -> ${target}: ${broken} broken`);
        }
    }

    if (errors.length) {
        throw new Error(`Demo data verification failed:\n- ${errors.join('\n- ')}`);
    }

    const total = Object.values(expectedCounts).reduce(
        (sum, count) => sum + count,
        0,
    );
    console.log(`Demo data verified: ${total} records in booking-demo.`);
    console.log(`Collections checked: ${Object.keys(expectedCounts).length}.`);
    console.log(`Order statuses: ${expectedStatuses.join(', ')}.`);
    console.log('References and admin credentials: OK.');
}

verify()
    .catch((error) => {
        console.error(error.message || error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect().catch(() => undefined);
    });
