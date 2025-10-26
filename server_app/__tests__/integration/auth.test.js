/**
 * 🧪 INTEGRATION TEST: Authentication API
 * Test đăng ký, đăng nhập và JWT token
 */

const request = require('supertest');
const { createTestApp } = require('../helpers/testApp');
const dbHandler = require('../helpers/dbHandler');
const User = require('../../API/Models/userModel');

const app = createTestApp();

describe('🔐 Authentication API Integration Tests', () => {
    // Setup: Connect to test DB before all tests
    beforeAll(async () => {
        await dbHandler.connect();
    });

    // Cleanup: Clear DB after each test
    afterEach(async () => {
        await dbHandler.clearDatabase();
    });

    // Teardown: Close DB connection after all tests
    afterAll(async () => {
        await dbHandler.closeDatabase();
    });

    describe('POST /api/auth/register', () => {
        test('✅ Đăng ký user mới thành công', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                phone: '0909999999',
                address: '123 Test Street, HCMC'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('_id');
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.fullName).toBe(userData.fullName);
            expect(response.body.data).toHaveProperty('token');

            // Verify user in database
            const userInDb = await User.findOne({ email: userData.email });
            expect(userInDb).toBeTruthy();
            expect(userInDb.fullName).toBe(userData.fullName);
        });

        test('❌ Đăng ký với email đã tồn tại', async () => {
            // Create existing user
            await User.create({
                fullName: 'Existing User',
                email: 'existing@example.com',
                password: 'password123',
                phone: '0909999999',
                address: '123 Test Street'
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    fullName: 'New User',
                    email: 'existing@example.com',
                    password: 'password456',
                    phone: '0909888888',
                    address: '456 Test Street'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('email');
        });

        test('❌ Đăng ký thiếu thông tin required', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com'
                    // Missing: fullName, password, phone, address
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create test user before each login test
            await User.create({
                fullName: 'Test User',
                email: 'test@example.com',
                password: '$2a$10$xyz', // hashed password
                phone: '0909999999',
                address: '123 Test Street'
            });
        });

        test('✅ Đăng nhập thành công', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe('test@example.com');
        });

        test('❌ Đăng nhập sai password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        test('❌ Đăng nhập với email không tồn tại', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });
});
