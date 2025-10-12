const express = require('express')
const router = express.Router()
const {
    getPromotions,
    getActivePromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    getProductsWithPromotions,
} = require('../Controllers/promotionController')
const { protect, authorize } = require('../Middleware/authMiddleware')

// Public routes
router.get('/active/:restaurantId', getActivePromotions)
router.get('/products/:restaurantId', getProductsWithPromotions)

// Restaurant owner routes
router.use(protect, authorize('restaurant'))
router.get('/', getPromotions)
router.post('/', createPromotion)
router.put('/:id', updatePromotion)
router.delete('/:id', deletePromotion)
router.patch('/:id/toggle', togglePromotionStatus)

module.exports = router
