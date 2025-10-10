const express = require('express')
const router = express.Router()
const asyncHandler = require('../Middleware/asyncHandler')
const { protect } = require('../Middleware/authMiddleware')

// Create payment
router.post('/create', protect, asyncHandler(async(req, res) => {
    const { orderId, paymentMethod, amount } = req.body

    // TODO: Implement payment gateway integration
    // VNPay, Momo, etc.

    res.json({
        success: true,
        data: {
            paymentUrl: 'https://payment-gateway.com/pay',
            message: 'Payment gateway integration coming soon',
        },
    })
}))

// Payment return (VNPay)
router.get('/vnpay-return', asyncHandler(async(req, res) => {
    // TODO: Handle VNPay return
    res.redirect(`${process.env.CLIENT_URL}/payment-result?status=success`)
}))

// Payment methods
router.get('/methods', asyncHandler(async(req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'COD', name: 'Cash on Delivery', icon: 'wallet' },
            { id: 'VNPAY', name: 'VNPay', icon: 'credit-card' },
            { id: 'MOMO', name: 'Momo', icon: 'mobile' },
        ],
    })
}))

module.exports = router