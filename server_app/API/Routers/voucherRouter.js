const express = require('express')
const router = express.Router()
const {
    getVouchers,
    getPublicVouchers,
    getVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
    getVoucherStats,
} = require('../Controllers/voucherController')
const { protect } = require('../Middleware/authMiddleware')

// Public routes
router.get('/public/:restaurantId', getPublicVouchers)

// Protected routes
router.post('/validate', protect, validateVoucher)

// Restaurant owner routes
router.route('/')
    .get(protect, getVouchers)
    .post(protect, createVoucher)

router.route('/:id')
    .get(protect, getVoucher)
    .put(protect, updateVoucher)
    .delete(protect, deleteVoucher)

router.get('/:id/stats', protect, getVoucherStats)

module.exports = router
