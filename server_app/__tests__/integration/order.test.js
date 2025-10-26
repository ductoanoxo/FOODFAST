/**
 * 🧪 INTEGRATION TEST: Order API
 * Test tạo order, tính toán và áp dụng voucher
 */

const request = require('supertest');
const { createTestApp } = require('../helpers/testApp');
const dbHandler = require('../helpers/dbHandler');
const Order = require('../../API/Models/orderModel');
const Product = require('../../API/Models/productModel');
const Voucher = require('../../API/Models/voucherModel');
const VoucherUsage = require('../../API/Models/voucherUsageModel');

const app = createTestApp();

describe('📦 Order API Integration Tests', () => {
    let testProduct;

    beforeAll(async () => {
        await dbHandler.connect();
    });

    beforeEach(async () => {
        // Create a test product
        testProduct = await Product.create({
            name: 'Test Pizza',
            price: 100000,
            description: 'Delicious test pizza',
            category: 'Food',
            stock: 100,
            restaurant: '507f1f77bcf86cd799439011'
        });
    });

    afterEach(async () => {
        await dbHandler.clearDatabase();
    });

    afterAll(async () => {
        await dbHandler.closeDatabase();
    });

    describe('POST /api/orders', () => {
        test('✅ Tạo order thành công không có voucher', async () => {
            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 2, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test User',
                    phone: '0909999999',
                    address: '123 Test Street, HCMC',
                    location: { lat: 10.8231, lng: 106.6297 }
                }
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.subtotal).toBe(200000); // 2 * 100k
            expect(response.body.data.deliveryFee).toBe(15000);
            expect(response.body.data.total).toBe(215000); // 200k + 15k
            expect(response.body.data.discountAmount).toBe(0);

            // Verify in database
            const orderInDb = await Order.findById(response.body.data._id);
            expect(orderInDb).toBeTruthy();
            expect(orderInDb.total).toBe(215000);
        });

        test('✅ Tạo order với voucher percentage', async () => {
            // Create voucher
            const voucher = await Voucher.create({
                code: 'DISCOUNT20',
                discountType: 'percentage',
                discountValue: 20,
                minOrder: 50000,
                maxDiscount: 50000,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 86400000), // +1 day
                usageLimit: 100,
                currentUsage: 0
            });

            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 2, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test User',
                    phone: '0909999999',
                    address: '123 Test Street, HCMC',
                    location: { lat: 10.8231, lng: 106.6297 }
                },
                voucherCode: 'DISCOUNT20'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.subtotal).toBe(200000);
            expect(response.body.data.discountAmount).toBe(40000); // 20% of 200k
            expect(response.body.data.total).toBe(175000); // 200k - 40k + 15k

            // Verify voucher usage
            const usage = await VoucherUsage.findOne({ voucher: voucher._id });
            expect(usage).toBeTruthy();
            expect(usage.discountApplied).toBe(40000);
        });

        test('✅ Tạo order với voucher fixed amount', async () => {
            const voucher = await Voucher.create({
                code: 'FIXED30K',
                discountType: 'fixed',
                discountValue: 30000,
                minOrder: 50000,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 86400000),
                usageLimit: 100,
                currentUsage: 0
            });

            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 2, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test User',
                    phone: '0909999999',
                    address: '123 Test Street, HCMC',
                    location: { lat: 10.8231, lng: 106.6297 }
                },
                voucherCode: 'FIXED30K'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(201);

            expect(response.body.data.subtotal).toBe(200000);
            expect(response.body.data.discountAmount).toBe(30000);
            expect(response.body.data.total).toBe(185000); // 200k - 30k + 15k
        });

        test('❌ Voucher không đủ điều kiện minOrder', async () => {
            await Voucher.create({
                code: 'HIGHMIN',
                discountType: 'percentage',
                discountValue: 10,
                minOrder: 500000, // Higher than order value
                validFrom: new Date(),
                validTo: new Date(Date.now() + 86400000),
                usageLimit: 100,
                currentUsage: 0
            });

            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 1, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test User',
                    phone: '0909999999',
                    address: '123 Test Street, HCMC',
                    location: { lat: 10.8231, lng: 106.6297 }
                },
                voucherCode: 'HIGHMIN'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('minimum');
        });

        test('❌ Voucher đã hết lượt sử dụng', async () => {
            await Voucher.create({
                code: 'EXPIRED',
                discountType: 'percentage',
                discountValue: 10,
                minOrder: 0,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 86400000),
                usageLimit: 5,
                currentUsage: 5 // Already maxed out
            });

            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 1, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test User',
                    phone: '0909999999',
                    address: '123 Test Street, HCMC',
                    location: { lat: 10.8231, lng: 106.6297 }
                },
                voucherCode: 'EXPIRED'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/orders', () => {
        test('✅ Lấy danh sách orders', async () => {
            // Create sample orders
            await Order.create([
                {
                    items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                    subtotal: 100000,
                    deliveryFee: 15000,
                    total: 115000,
                    status: 'pending',
                    deliveryInfo: {
                        name: 'User 1',
                        phone: '0909999999',
                        address: '123 Street'
                    }
                },
                {
                    items: [{ product: testProduct._id, quantity: 2, price: 100000 }],
                    subtotal: 200000,
                    deliveryFee: 15000,
                    total: 215000,
                    status: 'delivered',
                    deliveryInfo: {
                        name: 'User 2',
                        phone: '0909888888',
                        address: '456 Street'
                    }
                }
            ]);

            const response = await request(app)
                .get('/api/orders')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
        });

        test('✅ Filter orders by status', async () => {
            await Order.create([
                {
                    items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                    subtotal: 100000,
                    deliveryFee: 15000,
                    total: 115000,
                    status: 'pending',
                    deliveryInfo: { name: 'User 1', phone: '0909999999', address: '123' }
                },
                {
                    items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                    subtotal: 100000,
                    deliveryFee: 15000,
                    total: 115000,
                    status: 'delivered',
                    deliveryInfo: { name: 'User 2', phone: '0909888888', address: '456' }
                }
            ]);

            const response = await request(app)
                .get('/api/orders?status=pending')
                .expect(200);

            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].status).toBe('pending');
        });
    });
});
