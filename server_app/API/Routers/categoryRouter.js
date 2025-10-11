const express = require('express')
const router = express.Router()
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
} = require('../Controllers/categoryController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin'), createCategory)

router.route('/:id')
    .get(getCategoryById)
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory)

router.get('/:id/products', getCategoryProducts)

module.exports = router