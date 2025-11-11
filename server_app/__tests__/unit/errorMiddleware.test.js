// server_app/__tests__/unit/errorMiddleware.test.js

// Mock logger để không in log thật khi chạy test
jest.mock('../../API/Utils/logger', () => ({
  error: jest.fn(),
}));

const { errorHandler } = require('../../API/Middleware/errorMiddleware');
const logger = require('../../API/Utils/logger');

function mockReqRes() {
  const req = { method: 'GET', url: '/x', headers: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();
  return [req, res, next];
}

describe('errorMiddleware.errorHandler (unit)', () => {
  test('mặc định trả 500 và body chuẩn khi là lỗi thường', () => {
    const [req, res, next] = mockReqRes();
    const err = new Error('boom');
    err.stack = 'stacktrace';

    errorHandler(err, req, res, next);

    // logger được gọi đúng
    expect(logger.error).toHaveBeenCalledWith('boom', { stack: 'stacktrace' });

    // HTTP 500 và payload chuẩn
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'boom',
    });
  });

  test('tôn trọng err.statusCode nếu có (ví dụ 401)', () => {
    const [req, res, next] = mockReqRes();
    const err = new Error('unauthorized');
    err.statusCode = 401;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'unauthorized',
    });
  });

  test('CastError -> 404 "Resource not found"', () => {
    const [req, res, next] = mockReqRes();
    const err = new Error('invalid id');
    err.name = 'CastError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Resource not found',
    });
  });

  test('Duplicate key (code 11000) -> 400 "Duplicate field value entered"', () => {
    const [req, res, next] = mockReqRes();
    const err = new Error('dup');
    err.code = 11000;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Duplicate field value entered',
    });
  });

  test('ValidationError -> 400 và trả mảng thông báo', () => {
    const [req, res, next] = mockReqRes();
    const err = new Error('validation');
    err.name = 'ValidationError';
    err.errors = {
      name:   { message: 'Name is required' },
      email:  { message: 'Email is invalid' },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      // Vì code của bạn map sang array: Object.values(err.errors).map(val => val.message)
      error: ['Name is required', 'Email is invalid'],
    });
  });
  test('fallback message -> "Server Error" khi không có error.message và err.message', () => {
  const req = { method: 'GET', url: '/x', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  // Dùng object trống thay vì Error để không có err.message
  const err = {}; // không có message, không có statusCode

  const { errorHandler } = require('../../API/Middleware/errorMiddleware');

  errorHandler(err, req, res, next);

  // status mặc định 500
  expect(res.status).toHaveBeenCalledWith(500);
  // fallback sang 'Server Error'
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    error: 'Server Error',
  });
});

});
