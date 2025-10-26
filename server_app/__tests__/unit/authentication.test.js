/**
 * UNIT TEST: Authentication (JWT Token)
 * Chức năng: Generate & Verify JWT token
 * Độ quan trọng: ⭐⭐⭐⭐⭐ (Critical - security)
 */

const jwt = require('jsonwebtoken');

// Mock JWT functions
const authService = {

    // Generate JWT token
    generateToken(userId, role = 'user') {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const payload = {
            id: userId,
            role: role,
            iat: Math.floor(Date.now() / 1000)
        };

        const secret = process.env.JWT_SECRET || 'test-secret';
        const token = jwt.sign(payload, secret, { expiresIn: '7d' });

        return token;
    },

    // Verify JWT token
    verifyToken(token) {
        if (!token) {
            throw new Error('Token is required');
        }

        try {
            const secret = process.env.JWT_SECRET || 'test-secret';
            const decoded = jwt.verify(token, secret);
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            }
            throw new Error('Invalid token');
        }
    },

    // Extract user from token
    getUserFromToken(token) {
        const decoded = this.verifyToken(token);
        return {
            id: decoded.id,
            role: decoded.role
        };
    }
};

describe('🔐 Authentication (JWT) - UNIT TEST', () => {

    test('✅ GENERATE token thành công', () => {
        const userId = '507f1f77bcf86cd799439011';
        const token = authService.generateToken(userId, 'user');

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // JWT có 3 phần
    });

    test('✅ TOKEN chứa ĐÚNG thông tin user', () => {
        const userId = '507f1f77bcf86cd799439011';
        const role = 'admin';

        const token = authService.generateToken(userId, role);
        const decoded = authService.verifyToken(token);

        expect(decoded.id).toBe(userId);
        expect(decoded.role).toBe(role);
        expect(decoded.iat).toBeDefined();
    });

    test('✅ VERIFY token hợp lệ', () => {
        const token = authService.generateToken('user123', 'user');

        const decoded = authService.verifyToken(token);

        expect(decoded.id).toBe('user123');
        expect(decoded.role).toBe('user');
    });

    test('✅ EXTRACT user từ token', () => {
        const userId = '507f1f77bcf86cd799439011';
        const token = authService.generateToken(userId, 'admin');

        const user = authService.getUserFromToken(token);

        expect(user.id).toBe(userId);
        expect(user.role).toBe('admin');
    });

    test('❌ REJECT khi thiếu user ID', () => {
        expect(() => {
            authService.generateToken(null);
        }).toThrow('User ID is required');
    });

    test('❌ REJECT token không hợp lệ', () => {
        const invalidToken = 'invalid.token.here';

        expect(() => {
            authService.verifyToken(invalidToken);
        }).toThrow('Invalid token');
    });

    test('❌ REJECT khi thiếu token', () => {
        expect(() => {
            authService.verifyToken(null);
        }).toThrow('Token is required');

        expect(() => {
            authService.verifyToken('');
        }).toThrow('Token is required');
    });

    test('✅ Token có EXPIRATION time', () => {
        const token = authService.generateToken('user123', 'user');
        const decoded = authService.verifyToken(token);

        expect(decoded.exp).toBeDefined();
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test('✅ Tạo token với ROLE mặc định = user', () => {
        const token = authService.generateToken('user123');
        const decoded = authService.verifyToken(token);

        expect(decoded.role).toBe('user');
    });
});