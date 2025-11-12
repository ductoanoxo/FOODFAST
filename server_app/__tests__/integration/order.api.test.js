/**
 * 📦 INTEGRATION TEST: ORDER API ROUTES
 * Test toàn bộ Order Management endpoints (Flow quan trọng nhất!)
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const User = require('../../API/Models/User');
const Order = require('../../API/Models/Order');
const Product = require('../../API/Models/Product');
const Restaurant = require('../../API/Models/Restaurant');
const Drone = require('../../API/Models/Drone');
const Category = require('../../API/Models/Category');

const app = createTestApp();
let mongod;

describe('📦 ORDER API - INTEGRATION TESTS', () => {
    let customerToken, restaurantToken, adminToken;
    let testRestaurant, testProduct, testDrone;
    let restaurantOwnerId;

    beforeAll(async() => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        await mongoose.connect(uri);
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    beforeEach(async() => {
        // Tạo Customer
        const customerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Customer Order',
                email: 'customer@order.com',
                password: 'Customer@123',
                phone: '0901234567',
                role: 'customer'
            });
        customerToken = customerRes.body.data.token;

        // Tạo Restaurant Owner
        const restaurantRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Restaurant Owner',
                email: 'restaurant@order.com',
                password: 'Restaurant@123',
                phone: '0902345678',
                role: 'restaurant'
            });
        restaurantToken = restaurantRes.body.data.token;
        restaurantOwnerId = restaurantRes.body.data.user._id;

        // Tạo Admin
        const adminRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin Order',
                email: 'admin@order.com',
                password: 'Admin@123',
                phone: '0903456789',
                role: 'admin'
            });
        adminToken = adminRes.body.data.token;

        // Tạo Category
        const testCategory = await Category.create({
            name: 'Fast Food',
            slug: 'fast-food'
        });

        // Tạo Restaurant
        testRestaurant = await Restaurant.create({
            name: 'Order Test Restaurant',
            address: '123 Order St, HCM',
            location: {
                type: 'Point',
                coordinates: [106.660172, 10.762622]
            },
            phone: '0281234567',
            owner: restaurantOwnerId,
            isOpen: true
        });

        // Tạo Product
        testProduct = await Product.create({
            name: 'Burger',
            description: 'Tasty burger',
            price: 50000,
            category: testCategory._id,
            restaurant: testRestaurant._id,
            isAvailable: true
        });

        // Tạo Drone
        testDrone = await Drone.create({
            name: 'Drone Alpha',
            model: 'DJI Phantom 4',
            status: 'available',
            battery: 100,
            maxRange: 15,
            location: {
                type: 'Point',
                coordinates: [106.660172, 10.762622]
            }
        });
    });

    afterEach(async() => {
        await User.deleteMany({});
        await Order.deleteMany({});
        await Product.deleteMany({});
        await Restaurant.deleteMany({});
        await Drone.deleteMany({});
        await Category.deleteMany({});
    });

    // ==================== POST /api/orders (Create Order) ==================== //
    describe('POST /api/orders', () => {
        const validOrderData = {
            customer: {
                name: 'John Doe',
                phone: '0901234567',
                address: '456 Delivery St, District 1, HCM'
            },
            deliveryLocation: {
                type: 'Point',
                coordinates: [106.700172, 10.776622]
            },
            paymentMethod: 'cod',
            totalAmount: 100000
        };

        beforeEach(() => {
            validOrderData.restaurant = testRestaurant._id.toString();
            validOrderData.items = [{
                product: testProduct._id.toString(),
                quantity: 2,
                price: testProduct.price
            }];
        });

        test('✅ ORD-001: Customer tạo đơn hàng thành công', async() => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validOrderData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.status).toBe('pending');
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.items[0].quantity).toBe(2);
            expect(res.body.data.totalAmount).toBe(validOrderData.totalAmount);

            // Verify trong database
            const orderInDb = await Order.findById(res.body.data._id);
            expect(orderInDb).toBeTruthy();
            expect(orderInDb.status).toBe('pending');
        });

        test('✅ ORD-002: Order với payment method VNPay', async() => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({...validOrderData, paymentMethod: 'vnpay' });

            expect(res.status).toBe(201);
            expect(res.body.data.paymentMethod).toBe('vnpay');
        });

        test('❌ ORD-003: Lỗi khi không có authentication', async() => {
            const res = await request(app)
                .post('/api/orders')
                .send(validOrderData);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-004: Lỗi khi items rỗng', async() => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({...validOrderData, items: [] });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/items|sản phẩm/i);
        });

        test('❌ ORD-005: Lỗi khi thiếu customer info', async() => {
            const invalidData = {...validOrderData };
            delete invalidData.customer;

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(invalidData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-006: Lỗi khi deliveryLocation không hợp lệ', async() => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    ...validOrderData,
                    deliveryLocation: { coordinates: [200, 100] } // Invalid coordinates
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-007: Lỗi khi product không tồn tại', async() => {
            const fakeProductId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    ...validOrderData,
                    items: [{ product: fakeProductId, quantity: 1, price: 50000 }]
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-008: Lỗi khi quantity <= 0', async() => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    ...validOrderData,
                    items: [{ product: testProduct._id, quantity: 0, price: 50000 }]
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-009: Lỗi khi phone không hợp lệ', async() => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    ...validOrderData,
                    customer: {...validOrderData.customer, phone: '123' }
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== GET /api/orders (List Orders) ==================== //
    describe('GET /api/orders', () => {
        beforeEach(async() => {
            // Tạo 2 orders
            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 1, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'cod',
                    totalAmount: 50000
                });

            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 2, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'vnpay',
                    totalAmount: 100000
                });
        });

        test('✅ ORD-010: Customer lấy danh sách orders của mình', async() => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });

        test('✅ ORD-011: Admin lấy tất cả orders', async() => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        test('❌ ORD-012: Lỗi khi không có authentication', async() => {
            const res = await request(app).get('/api/orders');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== GET /api/orders/:id ==================== //
    describe('GET /api/orders/:id', () => {
        let orderId;

        beforeEach(async() => {
            const orderRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 1, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'cod',
                    totalAmount: 50000
                });
            orderId = orderRes.body.data._id;
        });

        test('✅ ORD-013: Lấy chi tiết order thành công', async() => {
            const res = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(orderId);
        });

        test('❌ ORD-014: Lỗi khi order không tồn tại', async() => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/orders/${fakeId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PATCH /api/orders/:id/status ==================== //
    describe('PATCH /api/orders/:id/status', () => {
        let orderId;

        beforeEach(async() => {
            const orderRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 1, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'cod',
                    totalAmount: 50000
                });
            orderId = orderRes.body.data._id;
        });

        test('✅ ORD-015: Restaurant cập nhật status: pending → confirmed', async() => {
            const res = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ status: 'confirmed' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('confirmed');
        });

        test('✅ ORD-016: Restaurant cập nhật status: confirmed → preparing', async() => {
            // Cập nhật lên confirmed trước
            await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ status: 'confirmed' });

            // Sau đó lên preparing
            const res = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ status: 'preparing' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('preparing');
        });

        test('✅ ORD-017: Admin có thể cập nhật bất kỳ status nào', async() => {
            const res = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'delivered' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('❌ ORD-018: Customer không thể cập nhật status', async() => {
            const res = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ status: 'confirmed' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-019: Lỗi khi status không hợp lệ', async() => {
            const res = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ status: 'invalid_status' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ ORD-020: Lỗi khi transition không hợp lệ (skip steps)', async() => {
            // Cố gắng chuyển trực tiếp từ pending → delivering (không hợp lệ)
            const res = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ status: 'delivering' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/transition|invalid/i);
        });
    });

    // ==================== PATCH /api/orders/:id/cancel ==================== //
    describe('PATCH /api/orders/:id/cancel', () => {
        let orderId;

        beforeEach(async() => {
            const orderRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 1, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'cod',
                    totalAmount: 50000
                });
            orderId = orderRes.body.data._id;
        });

        test('✅ ORD-021: Customer hủy đơn hàng thành công', async() => {
            const res = await request(app)
                .patch(`/api/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ reason: 'Đổi ý' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('cancelled');
        });

        test('✅ ORD-022: Admin hủy đơn hàng', async() => {
            const res = await request(app)
                .patch(`/api/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('cancelled');
        });

        test('❌ ORD-023: Không thể hủy đơn đã delivering', async() => {
            // Chuyển order lên delivering
            await Order.findByIdAndUpdate(orderId, { status: 'delivering' });

            const res = await request(app)
                .patch(`/api/orders/${orderId}/cancel`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/cannot cancel|không thể hủy/i);
        });
    });

    // ==================== GET /api/orders/:id/track ==================== //
    describe('GET /api/orders/:id/track', () => {
        let orderId;

        beforeEach(async() => {
            const orderRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 1, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'cod',
                    totalAmount: 50000
                });
            orderId = orderRes.body.data._id;
        });

        test('✅ ORD-024: Tracking đơn hàng thành công', async() => {
            const res = await request(app)
                .get(`/api/orders/${orderId}/track`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('order');
            expect(res.body.data).toHaveProperty('drone');
        });
    });

    // ==================== GET /api/orders/history ==================== //
    describe('GET /api/orders/history', () => {
        beforeEach(async() => {
            // Tạo 1 order hoàn tất
            const orderRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    restaurant: testRestaurant._id,
                    items: [{ product: testProduct._id, quantity: 1, price: 50000 }],
                    customer: { name: 'Test', phone: '0901234567', address: 'Test Address' },
                    deliveryLocation: { type: 'Point', coordinates: [106.7, 10.77] },
                    paymentMethod: 'cod',
                    totalAmount: 50000
                });

            // Update lên delivered
            await Order.findByIdAndUpdate(orderRes.body.data._id, { status: 'delivered' });
        });

        test('✅ ORD-025: Lấy lịch sử đơn hàng', async() => {
            const res = await request(app)
                .get('/api/orders/history')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });
});