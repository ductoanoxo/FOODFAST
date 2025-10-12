const express = require('express')
const router = express.Router()
const {
    getRestaurants,
    getRestaurantById,
    getNearbyRestaurants,
    createRestaurant,
    createRestaurantWithAccount,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMenu,
    getRestaurantOrders,
    toggleRestaurantStatus,
    getRestaurantStats,
} = require('../Controllers/restaurantController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.get('/nearby', getNearbyRestaurants)
router.get('/', getRestaurants)
router.post('/', protect, authorize('admin'), createRestaurant)
router.post('/create-with-account', protect, authorize('admin'), createRestaurantWithAccount)
router.get('/:id', getRestaurantById)
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurant)
router.delete('/:id', protect, authorize('admin'), deleteRestaurant)
router.get('/:id/menu', getRestaurantMenu)
router.get('/:id/orders', protect, authorize('restaurant', 'admin'), getRestaurantOrders)
router.patch('/:id/toggle-status', protect, authorize('restaurant', 'admin'), toggleRestaurantStatus)
router.get('/:id/stats', protect, authorize('restaurant', 'admin'), getRestaurantStats)

module.exports = router