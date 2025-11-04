const express = require('express')
const router = express.Router()
const {
    getRefundRequests,
    processManualRefund,
    getRefundStats,
    getRefundLogs,
} = require('../Controllers/refundController')
const { protect, admin } = require('../Middleware/authMiddleware')

// All routes require admin authentication
router.use(protect)
router.use(admin)

// @route   GET /api/refunds/stats
router.get('/stats', getRefundStats)

// @route   GET /api/refunds
router.get('/', getRefundRequests)

// @route   POST /api/refunds/:orderId/process
router.post('/:orderId/process', processManualRefund)

// @route   GET /api/refunds/:orderId/logs
router.get('/:orderId/logs', getRefundLogs)

module.exports = router
