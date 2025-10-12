const express = require('express')
const router = express.Router()
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
    getCategoriesWithProducts,
} = require('../Controllers/categoryController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin', 'restaurant'), createCategory)

// Get categories with products for restaurant
router.get('/restaurant/with-products', protect, authorize('restaurant'), getCategoriesWithProducts)

router.route('/:id')
    .get(getCategoryById)
    .put(protect, authorize('admin', 'restaurant'), updateCategory)
    .delete(protect, authorize('admin', 'restaurant'), deleteCategory)

router.get('/:id/products', getCategoryProducts)

module.exports = router