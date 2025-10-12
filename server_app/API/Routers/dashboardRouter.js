const express = require('express')
const router = express.Router()
const {
    getDashboardStats,
    getRecentOrders,
    getTopRestaurants,
    getOrderStatistics,
} = require('../Controllers/dashboardController')
const { protect, authorize } = require('../Middleware/authMiddleware')

// All routes require admin authentication
router.use(protect)
router.use(authorize('admin'))

router.get('/stats', getDashboardStats)
router.get('/recent-orders', getRecentOrders)
router.get('/top-restaurants', getTopRestaurants)
router.get('/order-stats', getOrderStatistics)

module.exports = router
