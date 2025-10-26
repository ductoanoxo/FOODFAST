/**
 * INTEGRATION TEST: Authentication Flow
 * Chức năng: Register, Login, JWT verification
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - security)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestApp = require('../helpers/testApp');
const User = require('../../API/Models/User');

const app = createTestApp();

let mongod;

beforeAll(async() => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri);
}, 30000);

afterEach(async() => {
    await User.deleteMany({});
});

afterAll(async() => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe('🔐 Authentication Flow - INTEGRATION TEST', () => {

    describe('POST /api/auth/register', () => {

        test('✅ ĐĂNG KÝ user mới THÀNH CÔNG', async() => {
            const userData = {
                name: 'New User',
                email: 'newuser@example.com',
                phone: '0901234567',
                password: 'password123',
                address: '123 Test Street'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Verify response
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.name).toBe('New User');
            expect(response.body.data.user.email).toBe('newuser@example.com');
            expect(response.body.data.user.password).toBeUndefined(); // Password không trả về
            expect(response.body.data.token).toBeDefined(); // JWT token

            // Verify user in database
            const userInDB = await User.findOne({ email: 'newuser@example.com' });
            expect(userInDB).toBeTruthy();
            expect(userInDB.name).toBe('New User');
            expect(userInDB.phone).toBe('0901234567');
            // Password should be hashed
            expect(userInDB.password).not.toBe('password123');
            expect(userInDB.password.length).toBeGreaterThan(20); // Bcrypt hash
        });

        test('✅ Default ROLE = user', async() => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '0901234567',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.data.user.role).toBe('user');
        });

        test('❌ REJECT khi EMAIL ĐÃ TỒN TẠI', async() => {
            // Create first user
            await User.create({
                name: 'Existing User',
                email: 'existing@example.com',
                phone: '0901111111',
                password: 'hashed_password',
                role: 'user'
            });

            // Try to register with same email
            const duplicateUser = {
                name: 'Another User',
                email: 'existing@example.com', // Same email
                phone: '0902222222',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(duplicateUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });

        test('❌ REJECT khi THIẾU required fields', async() => {
            const incompleteUser = {
                name: 'Test User'
                    // Missing: email, phone, password
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('❌ REJECT khi EMAIL không hợp lệ', async() => {
            const invalidUser = {
                name: 'Test User',
                email: 'invalid-email', // No @ or domain
                phone: '0901234567',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {

        beforeEach(async() => {
            // Create test user
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 10);

            await User.create({
                name: 'Login Test User',
                email: 'login@example.com',
                phone: '0901234567',
                password: hashedPassword,
                role: 'user'
            });
        });

        test('✅ ĐĂNG NHẬP thành công với email + password ĐÚNG', async() => {
            const credentials = {
                email: 'login@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect(200);

            // Verify response
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('login@example.com');
            expect(response.body.data.user.password).toBeUndefined();
            expect(response.body.data.token).toBeDefined();

            // Token should be valid JWT
            const token = response.body.data.token;
            expect(token.split('.').length).toBe(3); // JWT has 3 parts
        });

        test('✅ Trả về THÔNG TIN USER đầy đủ', async() => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                })
                .expect(200);

            const user = response.body.data.user;
            expect(user.name).toBe('Login Test User');
            expect(user.email).toBe('login@example.com');
            expect(user.phone).toBe('0901234567');
            expect(user.role).toBe('user');
        });

        test('❌ REJECT khi PASSWORD SAI', async() => {
            const wrongCredentials = {
                email: 'login@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(wrongCredentials)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });

        test('❌ REJECT khi EMAIL KHÔNG TỒN TẠI', async() => {
            const nonExistentUser = {
                email: 'notexist@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(nonExistentUser)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        test('❌ REJECT khi THIẾU email hoặc password', async() => {
            const response1 = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' }) // Missing password
                .expect(400);

            expect(response1.body.success).toBe(false);

            const response2 = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' }) // Missing email
                .expect(400);

            expect(response2.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me - Verify Token', () => {

        let userToken;
        let testUser;

        beforeEach(async() => {
            // Register và get token
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 10);

            testUser = await User.create({
                name: 'Auth User',
                email: 'auth@example.com',
                phone: '0901234567',
                password: hashedPassword,
                role: 'user'
            });

            // Login to get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'auth@example.com',
                    password: 'password123'
                });

            userToken = loginResponse.body.data.token;
        });

        test('✅ LẤY thông tin user từ VALID TOKEN', async() => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('auth@example.com');
            expect(response.body.data.name).toBe('Auth User');
        });

        test('❌ REJECT khi KHÔNG CÓ TOKEN', async() => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Not authorized');
        });

        test('❌ REJECT khi TOKEN KHÔNG HỢP LỆ', async() => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid.token.here')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Password Security', () => {

        test('✅ Password được HASH trước khi lưu DB', async() => {
            const userData = {
                name: 'Security Test',
                email: 'security@example.com',
                phone: '0901234567',
                password: 'mypassword123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            const userInDB = await User.findOne({ email: 'security@example.com' });

            // Password should NOT be plain text
            expect(userInDB.password).not.toBe('mypassword123');
            // Should be bcrypt hash (starts with $2a$ or $2b$)
            expect(userInDB.password).toMatch(/^\$2[ab]\$/);
            expect(userInDB.password.length).toBeGreaterThan(50);
        });

        test('✅ Password KHÔNG trả về trong response', async() => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'test@example.com',
                    phone: '0901234567',
                    password: 'password123'
                });

            expect(response.body.data.user.password).toBeUndefined();
        });
    });
});