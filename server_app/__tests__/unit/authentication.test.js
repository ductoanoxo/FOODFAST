/**
 * UNIT TEST: Authentication Controller
 * Chức năng: Test register, login functions với mock data
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - security)
 */

const { register, login } = require('../../API/Controllers/authController');
const User = require('../../API/Models/User');
const jwt = require('jsonwebtoken');

// Mock User Model
jest.mock('../../API/Models/User');

// Mock JWT
jest.mock('jsonwebtoken');

describe('🔐 Authentication Controller - UNIT TEST', () => {

    let mockReq, mockRes;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock request object
        mockReq = {
            body: {},
            user: {}
        };

        // Mock response object
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Mock JWT sign
        jwt.sign.mockReturnValue('mock-jwt-token-12345');
    });

    describe('📝 REGISTER - Đăng ký người dùng', () => {

        test('✅ Đăng ký THÀNH CÔNG với dữ liệu hợp lệ', async() => {
            // Mock data
            mockReq.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                phone: '0123456789'
            };

            // Mock User.findOne trả về null (user chưa tồn tại)
            User.findOne.mockResolvedValue(null);

            // Mock User.create trả về user mới
            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '0123456789',
                role: 'user',
                avatar: null,
                address: {}
            };
            User.create.mockResolvedValue(mockUser);

            // Call function
            await register(mockReq, mockRes);

            // Assertions
            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(User.create).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                phone: '0123456789'
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                user: expect.objectContaining({
                    _id: '507f1f77bcf86cd799439011',
                    name: 'John Doe',
                    email: 'john@example.com'
                }),
                token: 'mock-jwt-token-12345'
            });
        });

        test('❌ Đăng ký THẤT BẠI - Email đã tồn tại', async() => {
            // Mock data
            mockReq.body = {
                name: 'John Doe',
                email: 'existing@example.com',
                password: 'password123',
                phone: '0123456789'
            };

            // Mock User.findOne trả về user đã tồn tại
            User.findOne.mockResolvedValue({
                _id: '123',
                email: 'existing@example.com'
            });

            // Call function và expect error
            await expect(register(mockReq, mockRes)).rejects.toThrow('User already exists');

            expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
            expect(User.create).not.toHaveBeenCalled();
        });

        test('❌ Đăng ký THẤT BẠI - User.create trả về null', async() => {
            mockReq.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                phone: '0123456789'
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(null);

            await expect(register(mockReq, mockRes)).rejects.toThrow('Invalid user data');
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('🔑 LOGIN - Đăng nhập người dùng', () => {

        test('✅ Đăng nhập THÀNH CÔNG với email & password đúng', async() => {
            mockReq.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '0123456789',
                role: 'user',
                avatar: null,
                address: {},
                restaurantId: null,
                matchPassword: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await login(mockReq, mockRes);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                user: expect.objectContaining({
                    _id: '507f1f77bcf86cd799439011',
                    email: 'john@example.com'
                }),
                token: 'mock-jwt-token-12345'
            });
        });

        test('❌ Đăng nhập THẤT BẠI - Email không tồn tại', async() => {
            mockReq.body = {
                email: 'notfound@example.com',
                password: 'password123'
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(login(mockReq, mockRes)).rejects.toThrow('Invalid email or password');
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        test('❌ Đăng nhập THẤT BẠI - Password sai', async() => {
            mockReq.body = {
                email: 'john@example.com',
                password: 'wrongpassword'
            };

            const mockUser = {
                _id: '507f1f77bcf86cd799439011',
                email: 'john@example.com',
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await expect(login(mockReq, mockRes)).rejects.toThrow('Invalid email or password');
            expect(mockUser.matchPassword).toHaveBeenCalledWith('wrongpassword');
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });
});