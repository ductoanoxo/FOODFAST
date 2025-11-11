// __tests__/unit/authMiddleware.test.js
/**
 * Kiểm thử đơn vị cho protect & authorize (Jest)
 * - Tránh lỗi hoist của Jest: dùng đường dẫn literal trong jest.mock(...)
 * - Các mock đặt tên bắt đầu bằng "mock..." để Jest cho phép tham chiếu trong factory
 */

process.env.JWT_SECRET = 'testsecret';

// 1) Mock asyncHandler: bọc hàm async và đẩy lỗi vào next(err)
jest.mock('../../../API/Middleware/asyncHandler', () => {
    return jest.fn((fn) => (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next)
    );
});

// 2) Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));

// 3) Mock User model (findById().select(...))
const mockFindById = jest.fn();
jest.mock('../../../API/Models/User', () => ({
    findById: (...args) => mockFindById(...args),
}));

// Sau khi thiết lập mock xong mới import module cần test
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../../../API/Middleware/authMiddleware');

describe('authMiddleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = { headers: {} };

        res = {
            statusCode: 200,
            status: jest.fn(function(code) {
                this.statusCode = code;
                return this;
            }),
        };

        next = jest.fn();
    });

    const mockUserDoc = (user) => ({...user });

    const mockFindByIdToResolveUser = (user) => {
        // Giả lập: User.findById(...).select('-password')
        mockFindById.mockReturnValue({
            select: jest.fn().mockResolvedValue(user ? mockUserDoc(user) : null),
        });
    };

    // ===== Tests cho protect =====

    test('protect → token hợp lệ & user tồn tại ⇒ next() không lỗi', async() => {
        req.headers.authorization = 'Bearer valid.token.here';
        jwt.verify.mockReturnValue({ id: 'user123' });
        mockFindByIdToResolveUser({ _id: 'user123', role: 'admin', email: 'a@b.com' });

        await protect(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', 'testsecret');
        expect(mockFindById).toHaveBeenCalledWith('user123');
        expect(req.user).toBeDefined();
        expect(res.status).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    test('protect → 401 khi không có token', async() => {
        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalledTimes(1);
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(Error);
        expect(err.message.toLowerCase()).toContain('no token');
    });

    test('protect → 401 khi jwt.verify ném lỗi (token sai)', async() => {
        req.headers.authorization = 'Bearer invalid.token';
        jwt.verify.mockImplementation(() => {
            throw new Error('jwt malformed');
        });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(Error);
        expect(err.message.toLowerCase()).toContain('token failed');
    });

    test('protect → 401 khi user không tồn tại', async() => {
        req.headers.authorization = 'Bearer valid.token.here';
        jwt.verify.mockReturnValue({ id: 'ghost' });
        mockFindByIdToResolveUser(null);

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(Error);
        // Lưu ý: lỗi "user not found" bị catch và chuyển thành "token failed"
        expect(err.message.toLowerCase()).toContain('token failed');
    });

    // ===== Tests cho authorize =====

    describe('authorize', () => {
        test('authorize → cho phép khi role hợp lệ', () => {
            const mw = authorize('admin', 'manager');
            const req2 = { user: { role: 'admin' } };
            const res2 = { status: jest.fn(function(c) { this.statusCode = c; return this; }) };
            const next2 = jest.fn();

            mw(req2, res2, next2);

            expect(res2.status).not.toHaveBeenCalled();
            expect(next2).toHaveBeenCalledWith();
        });

        test('authorize → 403 khi role không hợp lệ', () => {
            const mw = authorize('admin', 'manager');
            const req2 = { user: { role: 'customer' } };
            const res2 = {
                statusCode: 200,
                status: jest.fn(function(c) { this.statusCode = c; return this; }),
            };
            const next2 = jest.fn();

            // authorize ném lỗi sync → bắt và đưa vào next2(err) để mô phỏng Express
            try {
                mw(req2, res2, next2);
            } catch (err) {
                next2(err);
            }

            expect(res2.status).toHaveBeenCalledWith(403);
            const err = next2.mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect(err.message.toLowerCase()).toContain('not authorized');
            expect(err.message).toContain('customer');
        });
    });
});