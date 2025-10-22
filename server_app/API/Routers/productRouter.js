const express = require('express')
const router = express.Router()
const { productUpload } = require('../../config/cloudinary')
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
    .post(protect, authorize('restaurant', 'admin'), productUpload.single('image'), createProduct)

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('restaurant', 'admin'), productUpload.single('image'), updateProduct)
    .delete(protect, authorize('restaurant', 'admin'), deleteProduct)

module.exports = router