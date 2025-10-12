const express = require('express')
const router = express.Router()
const {
    createReview,
    getProductReviews,
    getUserReviews,
    getRestaurantReviews,
    updateReview,
    deleteReview,
} = require('../Controllers/reviewController')
const { protect } = require('../Middleware/authMiddleware')

router.post('/', protect, createReview)
router.get('/product/:productId', getProductReviews)
router.get('/user/:userId', getUserReviews)
router.get('/restaurant/:restaurantId', getRestaurantReviews)
router.put('/:id', protect, updateReview)
router.delete('/:id', protect, deleteReview)

module.exports = router