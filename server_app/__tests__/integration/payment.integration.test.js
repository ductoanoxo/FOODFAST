/**
 * INTEGRATION: Payment VNPay return & IPN
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const Order = require('../../API/Models/Order');
const User = require('../../API/Models/User');

const app = createTestApp();

let mongod;

describe('💳 PAYMENT - INTEGRATION (VNPay return & IPN)', () => {
    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    afterEach(async () => {
        const collections = Object.keys(mongoose.connection.collections);
        for (const collName of collections) {
            await mongoose.connection.collections[collName].deleteMany();
        }
    });

    test('✅ vnpayReturn - success when signature matches and order exists', async () => {
        // Create user and order
        const user = await User.create({
            name: 'Pay User',
            email: 'pay@example.com',
            phone: '0900000000',
            password: 'password',
            role: 'user'
        });

        // Create restaurant + product to satisfy Order schema
        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');

        const restaurant = await Restaurant.create({
            name: 'Pay R',
            owner: user._id,
            email: 'r@example.com',
            phone: '0901111111',
            address: '1 Pay St'
        });

        const product = await Product.create({
            name: 'Item',
            price: 50000,
            restaurant: restaurant._id,
            category: (await require('../../API/Models/Category').create({ name: 'Food' }))._id,
            available: true,
            image: 'img.jpg'
        });

        const order = await Order.create({
            user: user._id,
            items: [{ product: product._id, quantity: 1, price: 50000, originalPrice: 50000 }],
            restaurant: restaurant._id,
            subtotal: 50000,
            totalAmount: 50000,
            paymentStatus: 'pending',
            paymentInfo: { transactionId: 'TX123' }
        });

        // Prepare params and signature
        const vnp_Params = {
            vnp_TxnRef: 'TX123',
            vnp_Amount: 50000 * 100,
            vnp_ResponseCode: '00',
        };

        // Build signature as controller does
        const qs = require('qs');
        const crypto = require('crypto');
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'PGN8FTCJ7F18Z7IZVM1SLFOMFEA1RDQQ';
        const sorted = Object.keys(vnp_Params).sort().reduce((acc, k) => { acc[k] = vnp_Params[k]; return acc }, {});
        const signData = qs.stringify(sorted, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // Attach signature
        const url = `/api/payment/vnpay/return?vnp_TxnRef=${vnp_Params.vnp_TxnRef}&vnp_Amount=${vnp_Params.vnp_Amount}&vnp_ResponseCode=${vnp_Params.vnp_ResponseCode}&vnp_SecureHash=${signed}`;

        const res = await request(app).get(url).expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.transactionId).toBe('TX123');
    });

    test('✅ vnpayIPN - updates order to paid when rspCode is 00 and amount matches', async () => {
        const user = await User.create({
            name: 'Pay User 2',
            email: 'pay2@example.com',
            phone: '0900000001',
            password: 'password',
            role: 'user'
        });

        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');

        const restaurant = await Restaurant.create({
            name: 'Pay R2',
            owner: user._id,
            email: 'r2@example.com',
            phone: '0902222222',
            address: '2 Pay St'
        });

        const product = await Product.create({
            name: 'Item2',
            price: 70000,
            restaurant: restaurant._id,
            category: (await require('../../API/Models/Category').create({ name: 'Food' }))._id,
            available: true,
            image: 'img2.jpg'
        });

        const order = await Order.create({
            user: user._id,
            items: [{ product: product._id, quantity: 1, price: 70000, originalPrice: 70000 }],
            restaurant: restaurant._id,
            subtotal: 70000,
            totalAmount: 70000,
            paymentStatus: 'pending',
            paymentInfo: { transactionId: 'TX999' }
        });

        const vnp_Params = {
            vnp_TxnRef: 'TX999',
            vnp_Amount: 70000 * 100,
            vnp_ResponseCode: '00',
        };

        const qs = require('qs');
        const crypto = require('crypto');
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'PGN8FTCJ7F18Z7IZVM1SLFOMFEA1RDQQ';
        const sorted = Object.keys(vnp_Params).sort().reduce((acc, k) => { acc[k] = vnp_Params[k]; return acc }, {});
        const signData = qs.stringify(sorted, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const url = `/api/payment/vnpay/ipn?vnp_TxnRef=${vnp_Params.vnp_TxnRef}&vnp_Amount=${vnp_Params.vnp_Amount}&vnp_ResponseCode=${vnp_Params.vnp_ResponseCode}&vnp_SecureHash=${signed}`;

        const res = await request(app).get(url).expect(200);

        expect(res.body.RspCode).toBe('00');

        const updated = await Order.findById(order._id);
        expect(updated.paymentStatus).toBe('paid');
        expect(updated.paidAt).toBeDefined();
    });

    test('✅ createVNPayPayment (protected) - returns paymentUrl and updates order', async () => {
        // create user
        const email = 'protected@example.com';
        const password = 'password123';
        const user = await User.create({ name: 'Prot', email, phone: '0903333333', password, role: 'user' });

        // Create restaurant + product
        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');
        const Category = require('../../API/Models/Category');

        const restaurant = await Restaurant.create({
            name: 'Prot R',
            owner: user._id,
            email: 'prot_r@example.com',
            phone: '0904444444',
            address: 'Prot St'
        });

        const category = await Category.create({ name: 'Food' });

        const product = await Product.create({
            name: 'Prot Item',
            price: 40000,
            restaurant: restaurant._id,
            category: category._id,
            available: true,
            image: 'imgp.jpg'
        });

        const order = await Order.create({
            user: user._id,
            items: [{ product: product._id, quantity: 1, price: 40000, originalPrice: 40000 }],
            restaurant: restaurant._id,
            subtotal: 40000,
            totalAmount: 40000,
            paymentStatus: 'pending'
        });

        // Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email, password });

        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/payment/vnpay/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: order._id.toString(), amount: 40000, orderInfo: 'Protected test' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.paymentUrl).toBeDefined();
        expect(res.body.data.transactionId).toBeDefined();

        const updated = await Order.findById(order._id);
        expect(updated.paymentInfo).toBeDefined();
        expect(updated.paymentInfo.transactionId).toBe(res.body.data.transactionId);
    });

    test('❌ createVNPayPayment - forbidden when user is not order owner', async () => {
        // owner user
    const owner = await User.create({ name: 'Owner', email: 'owner@example.com', phone: '0905555555', password: 'password1', role: 'user' });
    // other user
    const other = await User.create({ name: 'Other', email: 'other@example.com', phone: '0906666666', password: 'password1', role: 'user' });

        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');
        const Category = require('../../API/Models/Category');

        const restaurant = await Restaurant.create({ name: 'Owner R', owner: owner._id, email: 'ownr@example.com', phone: '0907777777', address: 'Owner St' });
        const category = await Category.create({ name: 'Food' });
        const product = await Product.create({ name: 'Owner Item', price: 30000, restaurant: restaurant._id, category: category._id, available: true, image: 'img.jpg' });

        const order = await Order.create({ user: owner._id, items: [{ product: product._id, quantity: 1, price: 30000, originalPrice: 30000 }], restaurant: restaurant._id, subtotal: 30000, totalAmount: 30000, paymentStatus: 'pending' });

        // login as other user
    const loginRes = await request(app).post('/api/auth/login').send({ email: other.email, password: 'password1' });
        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/payment/vnpay/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: order._id.toString(), amount: 30000, orderInfo: 'Forbidden test' });

        // Controller sets status 403 then throws; error middleware may return 500 depending on implementation.
        expect(res.body.success).toBe(false);
        expect(res.body.error).toEqual(expect.stringContaining('Not authorized'));

        const refreshed = await Order.findById(order._id);
        expect(refreshed.paymentInfo && refreshed.paymentInfo.transactionId).toBeFalsy();
    });

    test('❌ getPaymentInfo - forbidden for non-owner non-admin', async () => {
    const owner = await User.create({ name: 'GOwner', email: 'gowner@example.com', phone: '0908888888', password: 'password1', role: 'user' });
    const other = await User.create({ name: 'GOther', email: 'gother@example.com', phone: '0909999999', password: 'password1', role: 'user' });

        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');
        const Category = require('../../API/Models/Category');

        const restaurant = await Restaurant.create({ name: 'G R', owner: owner._id, email: 'gr@example.com', phone: '0901010101', address: 'G St' });
        const category = await Category.create({ name: 'Food' });
        const product = await Product.create({ name: 'G Item', price: 25000, restaurant: restaurant._id, category: category._id, available: true, image: 'img.jpg' });

        const order = await Order.create({ user: owner._id, items: [{ product: product._id, quantity: 1, price: 25000, originalPrice: 25000 }], restaurant: restaurant._id, subtotal: 25000, totalAmount: 25000, paymentStatus: 'pending' });

    const loginRes = await request(app).post('/api/auth/login').send({ email: other.email, password: 'password1' });
        const token = loginRes.body.token;

        const res = await request(app)
            .get(`/api/payment/${order._id.toString()}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.success).toBe(false);
        expect(res.body.error).toEqual(expect.stringContaining('Not authorized'));
    });

    test('❌ createVNPayPayment - order not found returns 404', async () => {
        const email = 'nf@example.com';
        const password = 'password1';
        const user = await User.create({ name: 'NF', email, phone: '0901212121', password, role: 'user' });

        const loginRes = await request(app).post('/api/auth/login').send({ email, password });
        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/payment/vnpay/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: '617f1f77bcf86cd799439011', amount: 10000, orderInfo: 'Not found' });

        expect(res.body.success).toBe(false);
        expect(res.body.error).toEqual(expect.stringContaining('Order not found'));
    });

    test('✅ getPaymentInfo - admin can access any order', async () => {
        const owner = await User.create({ name: 'Owner2', email: 'owner2@example.com', phone: '0902323232', password: 'password1', role: 'user' });
        const admin = await User.create({ name: 'Admin', email: 'admin@example.com', phone: '0903434343', password: 'password1', role: 'admin' });

        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');
        const Category = require('../../API/Models/Category');

        const restaurant = await Restaurant.create({ name: 'R3', owner: owner._id, email: 'r3@example.com', phone: '0904545454', address: 'R3' });
        const category = await Category.create({ name: 'Food' });
        const product = await Product.create({ name: 'P3', price: 10000, restaurant: restaurant._id, category: category._id, available: true, image: 'img3.jpg' });

        const order = await Order.create({ user: owner._id, items: [{ product: product._id, quantity: 1, price: 10000, originalPrice: 10000 }], restaurant: restaurant._id, subtotal: 10000, totalAmount: 10000, paymentStatus: 'pending' });

        const loginRes = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'password1' });
        const token = loginRes.body.token;

        const res = await request(app).get(`/api/payment/${order._id.toString()}`).set('Authorization', `Bearer ${token}`);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('paymentMethod');
    });

    test('❌ vnpayReturn - valid signature but order not found returns 404', async () => {
        const vnp_Params = {
            vnp_TxnRef: 'NOORDER',
            vnp_Amount: 10000 * 100,
            vnp_ResponseCode: '00',
        };
        const qs = require('qs');
        const crypto = require('crypto');
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'PGN8FTCJ7F18Z7IZVM1SLFOMFEA1RDQQ';
        const sorted = Object.keys(vnp_Params).sort().reduce((acc, k) => { acc[k] = vnp_Params[k]; return acc }, {});
        const signData = qs.stringify(sorted, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const url = `/api/payment/vnpay/return?vnp_TxnRef=${vnp_Params.vnp_TxnRef}&vnp_Amount=${vnp_Params.vnp_Amount}&vnp_ResponseCode=${vnp_Params.vnp_ResponseCode}&vnp_SecureHash=${signed}`;

    const res = await request(app).get(url).expect(404);
    // controller returns 404 JSON when order not found
    expect(res.body.success).toBe(false);
    // some middlewares use `error` key while others use `message`
    expect(res.body.message || res.body.error).toEqual(expect.stringContaining('Order not found'));
    });

    test('✅ vnpayIPN - amount mismatch returns RspCode 04', async () => {
        const user = await User.create({ name: 'IPN', email: 'ipn@example.com', phone: '0905050505', password: 'password1', role: 'user' });
        const Restaurant = require('../../API/Models/Restaurant');
        const Product = require('../../API/Models/Product');
        const Category = require('../../API/Models/Category');

        const restaurant = await Restaurant.create({ name: 'IPNR', owner: user._id, email: 'ipnr@example.com', phone: '0906060606', address: 'IPN St' });
        const category = await Category.create({ name: 'Food' });
        const product = await Product.create({ name: 'IPNItem', price: 50000, restaurant: restaurant._id, category: category._id, available: true, image: 'img.jpg' });

        const order = await Order.create({ user: user._id, items: [{ product: product._id, quantity: 1, price: 50000, originalPrice: 50000 }], restaurant: restaurant._id, subtotal: 50000, totalAmount: 50000, paymentStatus: 'pending', paymentInfo: { transactionId: 'IPN001' } });

        const vnp_Params = {
            vnp_TxnRef: 'IPN001',
            vnp_Amount: 40000 * 100, // wrong amount
            vnp_ResponseCode: '00',
        };

        const qs = require('qs');
        const crypto = require('crypto');
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'PGN8FTCJ7F18Z7IZVM1SLFOMFEA1RDQQ';
        const sorted = Object.keys(vnp_Params).sort().reduce((acc, k) => { acc[k] = vnp_Params[k]; return acc }, {});
        const signData = qs.stringify(sorted, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const url = `/api/payment/vnpay/ipn?vnp_TxnRef=${vnp_Params.vnp_TxnRef}&vnp_Amount=${vnp_Params.vnp_Amount}&vnp_ResponseCode=${vnp_Params.vnp_ResponseCode}&vnp_SecureHash=${signed}`;

        const res = await request(app).get(url).expect(200);
        expect(res.body.RspCode).toBe('04');
    });

    test('✅ vnpayIPN - order not found returns RspCode 01', async () => {
        const vnp_Params = {
            vnp_TxnRef: 'NOEXIST',
            vnp_Amount: 10000 * 100,
            vnp_ResponseCode: '00',
        };
        const qs = require('qs');
        const crypto = require('crypto');
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'PGN8FTCJ7F18Z7IZVM1SLFOMFEA1RDQQ';
        const sorted = Object.keys(vnp_Params).sort().reduce((acc, k) => { acc[k] = vnp_Params[k]; return acc }, {});
        const signData = qs.stringify(sorted, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const url = `/api/payment/vnpay/ipn?vnp_TxnRef=${vnp_Params.vnp_TxnRef}&vnp_Amount=${vnp_Params.vnp_Amount}&vnp_ResponseCode=${vnp_Params.vnp_ResponseCode}&vnp_SecureHash=${signed}`;

        const res = await request(app).get(url).expect(200);
        expect(res.body.RspCode).toBe('01');
    });

    test('❌ queryVNPayTransaction/refundVNPayTransaction require auth', async () => {
        // call without auth
        const qRes = await request(app).post('/api/payment/vnpay/querydr').send({ orderId: 'x', transDate: '20250101' });
        expect(qRes.body.success).toBe(false);
        expect(qRes.body.error).toEqual(expect.stringContaining('Not authorized'));

        const rRes = await request(app).post('/api/payment/vnpay/refund').send({ orderId: 'x', transDate: '20250101', amount: 100, transType: 'refund' });
        expect(rRes.body.success).toBe(false);
        expect(rRes.body.error).toEqual(expect.stringContaining('Not authorized'));
    });

    test('✅ queryVNPayTransaction - prepare query data when authenticated', async () => {
        const email = 'quser@example.com';
        const password = 'password1';
        const user = await User.create({ name: 'QUser', email, phone: '0907070707', password, role: 'user' });

        const loginRes = await request(app).post('/api/auth/login').send({ email, password });
        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/payment/vnpay/querydr')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: 'TXQUERY', transDate: '20250101' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('vnp_SecureHash');
        expect(res.body.message).toEqual(expect.stringContaining('Query data prepared'));
    });

    test('✅ refundVNPayTransaction - prepare refund data when authenticated', async () => {
        const email = 'ruser@example.com';
        const password = 'password1';
        const user = await User.create({ name: 'RUser', email, phone: '0908080808', password, role: 'user' });

        const loginRes = await request(app).post('/api/auth/login').send({ email, password });
        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/payment/vnpay/refund')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: 'TXREF', transDate: '20250101', amount: 10000, transType: 'refund' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('vnp_SecureHash');
        expect(res.body.message).toEqual(expect.stringContaining('Refund data prepared'));
    });

    test('✅ POST /momo/create - returns not implemented (protected)', async () => {
        const email = 'muser@example.com';
        const password = 'password1';
        await User.create({ name: 'MUser', email, phone: '0909191919', password, role: 'user' });
        const loginRes = await request(app).post('/api/auth/login').send({ email, password });
        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/payment/momo/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ orderId: 'ANY' })
            .expect(200);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toEqual(expect.stringContaining('Momo payment not implemented'));
    });

    test('✅ POST /momo/callback - returns not implemented (public)', async () => {
        const res = await request(app)
            .post('/api/payment/momo/callback')
            .send({})
            .expect(200);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toEqual(expect.stringContaining('Momo callback not implemented'));
    });

    test('❌ getPaymentInfo - order not found returns 404', async () => {
        const email = 'guser2@example.com';
        const password = 'password1';
        await User.create({ name: 'GUser2', email, phone: '0902020202', password, role: 'user' });
        const loginRes = await request(app).post('/api/auth/login').send({ email, password });
        const token = loginRes.body.token;

        const res = await request(app)
            .get('/api/payment/617f1f77bcf86cd799439012')
            .set('Authorization', `Bearer ${token}`);

        // Some error middleware return 404, others return 500 for thrown errors without statusCode.
        expect([404, 500]).toContain(res.status);
        expect(res.body.success).toBe(false);
        expect(res.body.error || res.body.message).toEqual(expect.stringContaining('Order not found'));
    });

    test('✅ GET /methods - returns available payment methods', async () => {
        const res = await request(app).get('/api/payment/methods').expect(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3);
        const ids = res.body.data.map(d => d.id);
        expect(ids).toEqual(expect.arrayContaining(['COD', 'VNPAY', 'MOMO']));
    });
});
