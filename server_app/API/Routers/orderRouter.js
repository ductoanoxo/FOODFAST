const express = require('express')
const router = express.Router()
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    trackOrder,
    cancelOrder,
    getOrderHistory,
} = require('../Controllers/orderController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.get('/history', protect, getOrderHistory)
router.get('/restaurant', protect, authorize('restaurant', 'admin'), getOrders)

router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder)

router.route('/:id')
    .get(protect, getOrderById)

router.patch('/:id/status', protect, authorize('restaurant', 'admin'), updateOrderStatus)
router.patch('/:id/cancel', protect, cancelOrder)
router.get('/:id/track', protect, trackOrder)

module.exports = router