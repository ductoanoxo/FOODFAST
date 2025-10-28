// server_app/__tests__/unit/asyncHandler.test.js

const asyncHandler = require('../../API/Middleware/asyncHandler');

function mockReqRes() {
  return [
    { headers: {} }, // req
    { status: jest.fn().mockReturnThis(), json: jest.fn() }, // res
    jest.fn(), // next
  ];
}

describe('asyncHandler (unit)', () => {
  test('gọi next(err) khi handler trả Promise bị reject', async () => {
    const error = new Error('failed');
    const fn = async () => { throw error; };
    const wrapped = asyncHandler(fn);
    const [req, res, next] = mockReqRes();

    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });

  test('gọi handler bình thường khi resolve', async () => {
    const fn = async (req, res) => {
      res.json({ ok: true });
    };
    const wrapped = asyncHandler(fn);
    const [req, res, next] = mockReqRes();

    await wrapped(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  test('⚠️ handler ném lỗi đồng bộ -> wrapper ném lỗi (không vào next)', () => {
    // Với implement hiện tại: Promise.resolve(fn(...)) *không* bắt lỗi ném đồng bộ,
    // nên lỗi sẽ "bật" ra thay vì đi vào next(err).
    const error = new Error('sync boom');
    const fn = () => { throw error; };
    const wrapped = asyncHandler(fn);
    const [req, res, next] = mockReqRes();

    expect(() => wrapped(req, res, next)).toThrow('sync boom');
    expect(next).not.toHaveBeenCalled();
  });
});
