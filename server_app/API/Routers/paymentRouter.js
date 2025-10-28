const express = require('express')
const router = express.Router()
const {
    createVNPayPayment,
    vnpayReturn,
    vnpayIPN,
    queryVNPayTransaction,
    refundVNPayTransaction,
    createMomoPayment,
    momoCallback,
    getPaymentInfo,
} = require('../Controllers/paymentController')
const { protect } = require('../Middleware/authMiddleware')

// VNPay routes
router.post('/vnpay/create', protect, createVNPayPayment)
router.get('/vnpay/return', vnpayReturn)
router.get('/vnpay/ipn', vnpayIPN)
router.post('/vnpay/querydr', protect, queryVNPayTransaction)
router.post('/vnpay/refund', protect, refundVNPayTransaction)

// Momo routes
router.post('/momo/create', protect, createMomoPayment)
router.post('/momo/callback', momoCallback)

// Get payment info
// Payment methods
router.get('/methods', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'COD', name: 'Thanh toán khi nhận hàng', icon: 'wallet' },
            { id: 'VNPAY', name: 'VNPay', icon: 'credit-card' },
            { id: 'MOMO', name: 'Momo', icon: 'mobile' },
        ],
    })
})

// Get payment info
router.get('/:orderId', protect, getPaymentInfo)

module.exports = router