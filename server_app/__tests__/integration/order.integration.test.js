/**
 * INTEGRATION TEST: Order Management API
 * Chức năng: Tạo đơn hàng, assign drone, voucher
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - core business)
 * 
 * Test: Order Creation → Voucher → Drone Assignment → Database
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const Order = require('../../API/Models/Order');

const app = createTestApp();
const Product = require('../../API/Models/Product');
const Restaurant = require('../../API/Models/Restaurant');
const User = require('../../API/Models/User');
const Drone = require('../../API/Models/Drone');
const Voucher = require('../../API/Models/Voucher');
const VoucherUsage = require('../../API/Models/VoucherUsage');

let mongod;
let testUser;
let testRestaurant;
let testProduct;
let testDrone;
let userToken;
let restaurantToken;
let restaurantUser;

beforeAll(async() => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri);

    // Register user and get token
    const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Test User',
            email: 'testuser@example.com',
            phone: '0901234567',
            password: 'password123'
        });

    userToken = registerResponse.body.token;
    testUser = await User.findOne({ email: 'testuser@example.com' });

    // Create restaurant user for status updates
    const restaurantRegister = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Restaurant Owner',
            email: 'restaurant@example.com',
            phone: '0907654321',
            password: 'password123'
        });

    restaurantToken = restaurantRegister.body.token;
    restaurantUser = await User.findOne({ email: 'restaurant@example.com' });
    restaurantUser.role = 'restaurant';
    await restaurantUser.save();

    testRestaurant = await Restaurant.create({
        name: 'Test Restaurant',
        owner: new mongoose.Types.ObjectId(),
        email: 'restaurant@test.com',
        phone: '0987654321',
        address: '123 Test Street',
        location: {
            type: 'Point',
            coordinates: [106.660172, 10.762622]
        },
        isOpen: true
    });

    testProduct = await Product.create({
        name: 'Test Pizza',
        price: 100000,
        restaurant: testRestaurant._id,
        category: new mongoose.Types.ObjectId(),
        isAvailable: true
    });

    testDrone = await Drone.create({
        name: 'Test Drone',
        model: 'DJI',
        serialNumber: 'TEST-DRONE-001',
        status: 'available',
        batteryLevel: 90,
        homeLocation: {
            type: 'Point',
            coordinates: [106.665172, 10.767622]
        },
        currentLocation: {
            type: 'Point',
            coordinates: [106.665172, 10.767622]
        },
        maxRange: 15,
        maxLoad: 3
    });

    userToken = 'mock-user-token';
}, 30000);

afterEach(async() => {
    await Order.deleteMany({});
    await Voucher.deleteMany({});
    await VoucherUsage.deleteMany({});

    // Reset drone status
    await Drone.updateMany({}, { status: 'available', batteryLevel: 90 });
});

afterAll(async() => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe('📦 Order Management API - INTEGRATION TEST', () => {

    describe('POST /api/orders - Create Order', () => {

        test('✅ TẠO đơn hàng THÀNH CÔNG và lưu vào DB', async() => {
            const orderData = {
                items: [{
                    product: testProduct._id,
                    quantity: 2,
                    price: testProduct.price
                }],
                deliveryInfo: {
                    name: 'Customer Name',
                    phone: '0909999999',
                    address: '456 Customer Street, District 1',
                    location: {
                        type: 'Point',
                        coordinates: [106.670172, 10.772622]
                    }
                },
                paymentMethod: 'COD',
                note: 'Test order'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(201);

            // Verify response
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBe(testUser._id.toString());
            expect(response.body.data.restaurant).toBe(testRestaurant._id.toString());
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].quantity).toBe(2);
            expect(response.body.data.subtotal).toBe(200000); // 100k × 2
            expect(response.body.data.deliveryFee).toBeDefined();
            expect(response.body.data.totalAmount).toBeDefined();
            expect(response.body.data.status).toBe('pending');

            // Verify data in database
            const orderInDB = await Order.findById(response.body.data._id);
            expect(orderInDB).toBeTruthy();
            expect(orderInDB.deliveryInfo.name).toBe('Customer Name');
            expect(orderInDB.note).toBe('Test order');
        });

        test('✅ TÍNH TOÁN tổng tiền ĐÚNG', async() => {
            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 3, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test',
                    phone: '0909999999',
                    address: '123 Street',
                    location: { coordinates: [106.67, 10.77] }
                },
                paymentMethod: 'COD',
                deliveryFee: 20000
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(201);

            // subtotal = 100k × 3 = 300k
            // deliveryFee = 20k
            // total = 320k
            expect(response.body.data.subtotal).toBe(300000);
            expect(response.body.data.deliveryFee).toBe(20000);
            expect(response.body.data.totalAmount).toBe(320000);
        });

        test('✅ ÁP DỤNG VOUCHER giảm giá THÀNH CÔNG', async() => {
            // Create voucher
            const voucher = await Voucher.create({
                code: 'DISCOUNT20',
                name: '20% Discount Voucher',
                discountType: 'percentage',
                discountValue: 20, // 20%
                minOrder: 50000,
                maxDiscount: 50000,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
                isActive: true,
                restaurant: testRestaurant._id,
                maxUsage: 100,
                usageCount: 0
            });

            const orderData = {
                items: [
                    { product: testProduct._id, quantity: 2, price: 100000 }
                ],
                deliveryInfo: {
                    name: 'Test',
                    phone: '0909999999',
                    address: '123 Street',
                    location: { coordinates: [106.67, 10.77] }
                },
                paymentMethod: 'COD',
                deliveryFee: 15000,
                voucherCode: 'DISCOUNT20'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(201);

            // Verify discount calculation
            // subtotal = 200k, discount = 20% = 40k
            // total = 200k + 15k - 40k = 175k
            expect(response.body.data.subtotal).toBe(200000);
            expect(response.body.data.discountAmount).toBe(40000);
            expect(response.body.data.totalAmount).toBe(175000);
            expect(response.body.data.appliedVoucher).toBe(voucher._id.toString());

            // Verify VoucherUsage created
            const voucherUsage = await VoucherUsage.findOne({
                voucher: voucher._id,
                user: testUser._id
            });
            expect(voucherUsage).toBeTruthy();
        });

        test('❌ REJECT voucher ĐÃ HẾT HẠN', async() => {
            const expiredVoucher = await Voucher.create({
                code: 'EXPIRED',
                name: 'Expired Voucher',
                discountType: 'percentage',
                discountValue: 20,
                minOrder: 0,
                validFrom: new Date('2024-01-01'),
                validUntil: new Date('2024-12-31'), // Expired
                isActive: true,
                restaurant: testRestaurant._id
            });

            const orderData = {
                items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                deliveryInfo: {
                    name: 'Test',
                    phone: '0909999999',
                    address: '123 Street',
                    location: { coordinates: [106.67, 10.77] }
                },
                paymentMethod: 'COD',
                voucherCode: 'EXPIRED'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('không hợp lệ');
        });

        test('❌ REJECT khi ĐƠN HÀNG < MIN ORDER của voucher', async() => {
            const voucher = await Voucher.create({
                code: 'MIN100K',
                name: 'Minimum 100K Order',
                discountType: 'percentage',
                discountValue: 10,
                minOrder: 100000, // Min 100k
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2025-12-31'),
                isActive: true,
                restaurant: testRestaurant._id
            });

            const orderData = {
                items: [{ product: testProduct._id, quantity: 1, price: 50000 }], // Only 50k
                deliveryInfo: {
                    name: 'Test',
                    phone: '0909999999',
                    address: '123 Street',
                    location: { coordinates: [106.67, 10.77] }
                },
                paymentMethod: 'COD',
                voucherCode: 'MIN100K'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('❌ REJECT khi RESTAURANT ĐÓNG CỬA', async() => {
            // Close restaurant
            await Restaurant.findByIdAndUpdate(testRestaurant._id, { isOpen: false });

            const orderData = {
                items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                deliveryInfo: {
                    name: 'Test',
                    phone: '0909999999',
                    address: '123 Street',
                    location: { coordinates: [106.67, 10.77] }
                },
                paymentMethod: 'COD'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.message).toContain('đóng cửa');

            // Restore
            await Restaurant.findByIdAndUpdate(testRestaurant._id, { isOpen: true });
        });

        test('❌ REJECT khi THIẾU delivery info', async() => {
            const orderData = {
                items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                // Missing deliveryInfo
                paymentMethod: 'COD'
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/orders/:id', () => {

        test('✅ LẤY chi tiết ORDER với POPULATE data', async() => {
            // Create order
            const order = await Order.create({
                user: testUser._id,
                restaurant: testRestaurant._id,
                items: [{
                    product: testProduct._id,
                    quantity: 2,
                    price: 100000
                }],
                deliveryInfo: {
                    name: 'Test Customer',
                    phone: '0909999999',
                    address: '123 Street'
                },
                subtotalAmount: 200000,
                deliveryFee: 15000,
                totalAmount: 215000,
                status: 'pending',
                paymentMethod: 'COD'
            });

            const response = await request(app)
                .get(`/api/orders/${order._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(order._id.toString());
            expect(response.body.data.status).toBe('pending');
            expect(response.body.data.totalAmount).toBe(215000);
        });
    });

    describe('PUT /api/orders/:id/status', () => {

        test('✅ CẬP NHẬT trạng thái order', async() => {
            const order = await Order.create({
                user: testUser._id,
                restaurant: testRestaurant._id,
                items: [{ product: testProduct._id, quantity: 1, price: 100000 }],
                deliveryInfo: { name: 'Test', phone: '0909999999', address: '123' },
                subtotalAmount: 100000,
                deliveryFee: 15000,
                totalAmount: 115000,
                status: 'pending',
                paymentMethod: 'COD'
            });

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ status: 'confirmed' })
                .expect(200);

            expect(response.body.data.status).toBe('confirmed');

            // Verify DB updated
            const updatedOrder = await Order.findById(order._id);
            expect(updatedOrder.status).toBe('confirmed');
        });
    });
});
