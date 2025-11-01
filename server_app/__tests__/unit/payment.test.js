/**
 * UNIT TEST: Payment Controller
 */

jest.mock('../../API/Models/Order');

const Order = require('../../API/Models/Order');

const {
    createVNPayPayment,
    vnpayReturn,
    vnpayIPN,
    getPaymentInfo,
} = require('../../API/Controllers/paymentController');

describe('💳 PAYMENT CONTROLLER - Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, headers: {}, connection: {}, socket: {}, user: null };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

        Order.findById = Order.findById || jest.fn();
        Order.findOne = Order.findOne || jest.fn();
    });

    test('✅ createVNPayPayment - creates paymentUrl and updates order', async () => {
        const mockOrder = {
            _id: 'ord1',
            user: { toString: () => 'user1' },
            save: jest.fn().mockResolvedValue(true),
        };

        Order.findById.mockResolvedValue(mockOrder);

        req.body = { orderId: 'ord1', amount: 100000, orderInfo: 'test' };
        req.user = { _id: 'user1' };
        req.headers = { 'x-forwarded-for': '127.0.0.1' };

        await createVNPayPayment(req, res);

        expect(Order.findById).toHaveBeenCalledWith('ord1');
        expect(mockOrder.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Object) }));
    });

    test('✅ vnpayReturn - invalid signature returns 400', async () => {
        req.query = { vnp_SecureHash: 'bad', vnp_TxnRef: 'tx1', vnp_ResponseCode: '00' };

        await vnpayReturn(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, code: '97' }));
    });

    test('✅ vnpayIPN - checksum failed when signature mismatch', async () => {
        req.query = { vnp_SecureHash: 'bad', vnp_ResponseCode: '00', vnp_TxnRef: 'tx1' };

        await vnpayIPN(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ RspCode: '97' }));
    });

    test('✅ getPaymentInfo - returns payment info for owner', async () => {
        const mockOrder = {
            _id: 'ord1',
            user: { toString: () => 'user1' },
            paymentMethod: 'VNPAY',
            paymentStatus: 'pending',
            paymentInfo: { transactionId: 'tx1' },
            totalAmount: 100000,
            paidAt: null
        };

        Order.findById.mockResolvedValue(mockOrder);

        req.params.orderId = 'ord1';
        req.user = { _id: 'user1', role: 'user' };

        await getPaymentInfo(req, res);

        expect(Order.findById).toHaveBeenCalledWith('ord1');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Object) }));
    });
});
