const express = require('express')
const router = express.Router()
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getPopularProducts,
} = require('../Controllers/productController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.get('/popular', getPopularProducts)
router.get('/restaurant', protect, authorize('restaurant', 'admin'), getProducts)

router.route('/')
    .get(getProducts)
    .post(protect, authorize('restaurant', 'admin'), createProduct)

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('restaurant', 'admin'), updateProduct)
    .delete(protect, authorize('restaurant', 'admin'), deleteProduct)

module.exports = router