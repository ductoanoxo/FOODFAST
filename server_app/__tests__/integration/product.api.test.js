/**
 * 🍔 INTEGRATION TEST: PRODUCT API ROUTES
 * Test toàn bộ Product Management endpoints
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const User = require('../../API/Models/User');
const Product = require('../../API/Models/Product');
const Restaurant = require('../../API/Models/Restaurant');
const Category = require('../../API/Models/Category');

const app = createTestApp();
let mongod;

describe('🍔 PRODUCT API - INTEGRATION TESTS', () => {
    let customerToken, restaurantToken, adminToken;
    let testRestaurant, testCategory;
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
                name: 'Customer User',
                email: 'customer@test.com',
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
                email: 'restaurant@test.com',
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
                name: 'Admin User',
                email: 'admin@test.com',
                password: 'Admin@123',
                phone: '0903456789',
                role: 'admin'
            });
        adminToken = adminRes.body.data.token;

        // Tạo Category
        testCategory = await Category.create({
            name: 'Main Dish',
            slug: 'main-dish',
            description: 'Main dishes'
        });

        // Tạo Restaurant
        testRestaurant = await Restaurant.create({
            name: 'Test Restaurant',
            address: '123 Test Street, HCM',
            location: {
                type: 'Point',
                coordinates: [106.660172, 10.762622]
            },
            phone: '0281234567',
            owner: restaurantOwnerId,
            isOpen: true
        });
    });

    afterEach(async() => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Restaurant.deleteMany({});
        await Category.deleteMany({});
    });

    // ==================== GET /api/products ==================== //
    describe('GET /api/products', () => {
        beforeEach(async() => {
            // Tạo 3 sản phẩm test
            await Product.create([{
                    name: 'Phở Bò',
                    description: 'Phở bò Hà Nội',
                    price: 50000,
                    category: testCategory._id,
                    restaurant: testRestaurant._id,
                    isAvailable: true
                },
                {
                    name: 'Bún Chả',
                    description: 'Bún chả Hà Nội',
                    price: 45000,
                    category: testCategory._id,
                    restaurant: testRestaurant._id,
                    isAvailable: true
                },
                {
                    name: 'Cơm Tấm',
                    description: 'Cơm tấm sườn',
                    price: 40000,
                    category: testCategory._id,
                    restaurant: testRestaurant._id,
                    isAvailable: false // Không available
                }
            ]);
        });

        test('✅ PROD-001: Lấy danh sách tất cả sản phẩm (public)', async() => {
            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(3);
        });

        test('✅ PROD-002: Lọc sản phẩm theo category', async() => {
            const res = await request(app)
                .get('/api/products')
                .query({ category: testCategory._id });

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.every(p => p.category._id.toString() === testCategory._id.toString())).toBe(true);
        });

        test('✅ PROD-003: Lọc sản phẩm theo restaurant', async() => {
            const res = await request(app)
                .get('/api/products')
                .query({ restaurant: testRestaurant._id });

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThanOrEqual(3);
        });

        test('✅ PROD-004: Lọc sản phẩm theo giá (minPrice, maxPrice)', async() => {
            const res = await request(app)
                .get('/api/products')
                .query({ minPrice: 40000, maxPrice: 50000 });

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.every(p => p.price >= 40000 && p.price <= 50000)).toBe(true);
        });

        test('✅ PROD-005: Tìm kiếm sản phẩm theo tên (search)', async() => {
            const res = await request(app)
                .get('/api/products')
                .query({ search: 'Phở' });

            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.some(p => p.name.includes('Phở'))).toBe(true);
        });
    });

    // ==================== GET /api/products/:id ==================== //
    describe('GET /api/products/:id', () => {
        let productId;

        beforeEach(async() => {
            const product = await Product.create({
                name: 'Test Product',
                description: 'Test description',
                price: 100000,
                category: testCategory._id,
                restaurant: testRestaurant._id,
                isAvailable: true
            });
            productId = product._id;
        });

        test('✅ PROD-006: Lấy chi tiết sản phẩm theo ID', async() => {
            const res = await request(app).get(`/api/products/${productId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id.toString()).toBe(productId.toString());
            expect(res.body.data.name).toBe('Test Product');
        });

        test('❌ PROD-007: Lỗi khi product ID không tồn tại', async() => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/products/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test('❌ PROD-008: Lỗi khi product ID không hợp lệ', async() => {
            const res = await request(app).get('/api/products/invalid_id');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== POST /api/products (Create) ==================== //
    describe('POST /api/products', () => {
        const validProductData = {
            name: 'New Product',
            description: 'New product description',
            price: 80000,
            category: null, // Sẽ set trong test
            restaurant: null, // Sẽ set trong test
            isAvailable: true
        };

        beforeEach(() => {
            validProductData.category = testCategory._id.toString();
            validProductData.restaurant = testRestaurant._id.toString();
        });

        test('✅ PROD-009: Restaurant owner tạo sản phẩm thành công', async() => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send(validProductData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(validProductData.name);
            expect(res.body.data.price).toBe(validProductData.price);

            // Verify trong database
            const productInDb = await Product.findById(res.body.data._id);
            expect(productInDb).toBeTruthy();
        });

        test('✅ PROD-010: Admin tạo sản phẩm thành công', async() => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validProductData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        test('❌ PROD-011: Customer không thể tạo sản phẩm', async() => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validProductData);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('❌ PROD-012: Lỗi khi không có token', async() => {
            const res = await request(app)
                .post('/api/products')
                .send(validProductData);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('❌ PROD-013: Lỗi khi thiếu trường name', async() => {
            const invalidData = {...validProductData };
            delete invalidData.name;

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send(invalidData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ PROD-014: Lỗi khi price <= 0', async() => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({...validProductData, price: -1000 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ PROD-015: Lỗi khi category không tồn tại', async() => {
            const fakeCategory = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({...validProductData, category: fakeCategory });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PUT /api/products/:id (Update) ==================== //
    describe('PUT /api/products/:id', () => {
        let productId;

        beforeEach(async() => {
            const product = await Product.create({
                name: 'Old Product',
                description: 'Old description',
                price: 50000,
                category: testCategory._id,
                restaurant: testRestaurant._id,
                isAvailable: true
            });
            productId = product._id;
        });

        test('✅ PROD-016: Restaurant owner cập nhật sản phẩm của mình', async() => {
            const updateData = {
                name: 'Updated Product',
                price: 60000,
                description: 'Updated description'
            };

            const res = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.price).toBe(updateData.price);
        });

        test('✅ PROD-017: Admin cập nhật bất kỳ sản phẩm nào', async() => {
            const res = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Admin Updated' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('❌ PROD-018: Customer không thể cập nhật sản phẩm', async() => {
            const res = await request(app)
                .put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ name: 'Hacked' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('❌ PROD-019: Lỗi khi product không tồn tại', async() => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/products/${fakeId}`)
                .set('Authorization', `Bearer ${restaurantToken}`)
                .send({ name: 'Updated' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== DELETE /api/products/:id ==================== //
    describe('DELETE /api/products/:id', () => {
        let productId;

        beforeEach(async() => {
            const product = await Product.create({
                name: 'To Delete Product',
                price: 30000,
                category: testCategory._id,
                restaurant: testRestaurant._id,
                isAvailable: true
            });
            productId = product._id;
        });

        test('✅ PROD-020: Restaurant owner xóa sản phẩm của mình', async() => {
            const res = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${restaurantToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify đã bị xóa
            const productInDb = await Product.findById(productId);
            expect(productInDb).toBeNull();
        });

        test('✅ PROD-021: Admin xóa bất kỳ sản phẩm nào', async() => {
            const res = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('❌ PROD-022: Customer không thể xóa sản phẩm', async() => {
            const res = await request(app)
                .delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);

            // Verify chưa bị xóa
            const productInDb = await Product.findById(productId);
            expect(productInDb).toBeTruthy();
        });
    });

    // ==================== GET /api/products/popular ==================== //
    describe('GET /api/products/popular', () => {
        test('✅ PROD-023: Lấy sản phẩm phổ biến (public)', async() => {
            const res = await request(app).get('/api/products/popular');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });
});