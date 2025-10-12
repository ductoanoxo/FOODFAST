const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
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

// Multer configuration for restaurant image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, 'restaurant-' + uniqueSuffix + path.extname(file.originalname))
    },
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Only image files are allowed!'))
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
})

router.get('/nearby', getNearbyRestaurants)
router.get('/', getRestaurants)
router.post('/', protect, authorize('admin'), createRestaurant)
router.post('/create-with-account', protect, authorize('admin'), createRestaurantWithAccount)
router.get('/:id', getRestaurantById)
router.put('/:id', protect, authorize('restaurant', 'admin'), upload.single('image'), updateRestaurant)
router.delete('/:id', protect, authorize('admin'), deleteRestaurant)
router.get('/:id/menu', getRestaurantMenu)
router.get('/:id/orders', protect, authorize('restaurant', 'admin'), getRestaurantOrders)
router.patch('/:id/toggle-status', protect, authorize('restaurant', 'admin'), toggleRestaurantStatus)
router.get('/:id/stats', protect, authorize('restaurant', 'admin'), getRestaurantStats)

module.exports = router