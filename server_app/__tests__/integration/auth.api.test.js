/**
 * 🔐 INTEGRATION TEST: AUTH API ROUTES
 * Test toàn bộ Authentication & Authorization endpoints
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const User = require('../../API/Models/User');

const app = createTestApp();
let mongod;

describe('🔐 AUTH API - INTEGRATION TESTS', () => {

    beforeAll(async() => {
        // Setup in-memory MongoDB
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

    afterEach(async() => {
        // Clean up database sau mỗi test
        await User.deleteMany({});
    });

    // ==================== POST /api/auth/register ==================== //
    describe('POST /api/auth/register', () => {
        const validUserData = {
            name: 'Test User',
            email: 'testuser@foodfast.com',
            password: 'Test@123456',
            phone: '0901234567',
            role: 'customer'
        };

        test('✅ AUTH-001: Đăng ký customer thành công với dữ liệu hợp lệ', async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUserData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('_id');
            expect(res.body.data.user.email).toBe(validUserData.email);
            expect(res.body.data.user.role).toBe('customer');
            expect(res.body.data.user).not.toHaveProperty('password');

            // Verify user trong database
            const userInDb = await User.findOne({ email: validUserData.email });
            expect(userInDb).toBeTruthy();
            expect(userInDb.name).toBe(validUserData.name);
            expect(userInDb.password).not.toBe(validUserData.password); // Password phải được hash
        });

        test('✅ AUTH-002: Đăng ký restaurant owner thành công', async() => {
            const restaurantOwner = {
                ...validUserData,
                email: 'owner@restaurant.com',
                role: 'restaurant'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(restaurantOwner);

            expect(res.status).toBe(201);
            expect(res.body.data.user.role).toBe('restaurant');
        });

        test('❌ AUTH-003: Lỗi khi email đã tồn tại', async() => {
            // Tạo user lần 1
            await request(app).post('/api/auth/register').send(validUserData);

            // Tạo lại lần 2 với email trùng
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUserData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/already exists|đã tồn tại/i);
        });

        test('❌ AUTH-004: Lỗi khi thiếu trường name', async() => {
            const invalidData = {...validUserData };
            delete invalidData.name;

            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ AUTH-005: Lỗi khi email không hợp lệ', async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({...validUserData, email: 'invalid-email-format' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ AUTH-006: Lỗi khi password quá ngắn', async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({...validUserData, password: '123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/password/i);
        });

        test('❌ AUTH-007: Lỗi khi phone không hợp lệ (không phải số VN)', async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({...validUserData, phone: '1234567890' }); // Không bắt đầu bằng 0

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('❌ AUTH-008: Lỗi khi role không hợp lệ', async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({...validUserData, role: 'invalid_role' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== POST /api/auth/login ==================== //
    describe('POST /api/auth/login', () => {
        const userData = {
            name: 'Login Test User',
            email: 'login@foodfast.com',
            password: 'Login@123456',
            phone: '0901234567',
            role: 'customer'
        };

        beforeEach(async() => {
            // Tạo user trước mỗi test
            await request(app).post('/api/auth/register').send(userData);
        });

        test('✅ AUTH-009: Đăng nhập thành công với credentials hợp lệ', async() => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(userData.email);
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        test('❌ AUTH-010: Lỗi khi sai password', async() => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: 'WrongPassword123'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/invalid|incorrect|sai/i);
        });

        test('❌ AUTH-011: Lỗi khi email không tồn tại', async() => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'notexist@foodfast.com',
                    password: 'SomePassword123'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('❌ AUTH-012: Lỗi khi thiếu email hoặc password', async() => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: userData.email }); // Thiếu password

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('✅ AUTH-013: Token được tạo ra hợp lệ (có thể decode)', async() => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            const token = res.body.data.token;
            expect(token).toBeTruthy();
            expect(token.split('.')).toHaveLength(3); // JWT có 3 phần
        });
    });

    // ==================== GET /api/auth/me (Protected Route) ==================== //
    describe('GET /api/auth/me', () => {
        let authToken;
        let userId;

        beforeEach(async() => {
            // Đăng ký và lấy token
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Protected User',
                    email: 'protected@foodfast.com',
                    password: 'Protected@123',
                    phone: '0901234567',
                    role: 'customer'
                });

            authToken = res.body.data.token;
            userId = res.body.data.user._id;
        });

        test('✅ AUTH-014: Lấy profile thành công với token hợp lệ', async() => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('protected@foodfast.com');
            expect(res.body.data._id).toBe(userId);
            expect(res.body.data).not.toHaveProperty('password');
        });

        test('❌ AUTH-015: Lỗi khi không có token', async() => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/token|unauthorized/i);
        });

        test('❌ AUTH-016: Lỗi khi token không hợp lệ', async() => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token_here');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('❌ AUTH-017: Lỗi khi token format sai (không có "Bearer")', async() => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', authToken); // Thiếu "Bearer"

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== PUT /api/auth/profile ==================== //
    describe('PUT /api/auth/profile', () => {
        let authToken;

        beforeEach(async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Update User',
                    email: 'update@foodfast.com',
                    password: 'Update@123',
                    phone: '0901234567',
                    role: 'customer'
                });

            authToken = res.body.data.token;
        });

        test('✅ AUTH-018: Cập nhật profile thành công', async() => {
            const updateData = {
                name: 'Updated Name',
                phone: '0987654321',
                address: '456 New Street'
            };

            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.phone).toBe(updateData.phone);
            expect(res.body.data.address).toBe(updateData.address);
        });

        test('❌ AUTH-019: Không thể cập nhật email (bảo mật)', async() => {
            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ email: 'newemail@foodfast.com' });

            // Email không được update hoặc trả về lỗi
            expect([200, 400]).toContain(res.status);

            if (res.status === 200) {
                expect(res.body.data.email).toBe('update@foodfast.com'); // Email không đổi
            }
        });

        test('❌ AUTH-020: Lỗi khi không có token', async() => {
            const res = await request(app)
                .put('/api/auth/profile')
                .send({ name: 'New Name' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================== POST /api/auth/logout ==================== //
    describe('POST /api/auth/logout', () => {
        let authToken;

        beforeEach(async() => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Logout User',
                    email: 'logout@foodfast.com',
                    password: 'Logout@123',
                    phone: '0901234567',
                    role: 'customer'
                });

            authToken = res.body.data.token;
        });

        test('✅ AUTH-021: Đăng xuất thành công', async() => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/logout|đăng xuất/i);
        });
    });
});