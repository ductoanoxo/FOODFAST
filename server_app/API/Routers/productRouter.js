const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getPopularProducts,
} = require('../Controllers/productController')
const { protect, authorize } = require('../Middleware/authMiddleware')

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    },
})

// File filter
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

router.get('/popular', getPopularProducts)
router.get('/restaurant', protect, authorize('restaurant', 'admin'), getProducts)

router.route('/')
    .get(getProducts)
    .post(protect, authorize('restaurant', 'admin'), upload.single('image'), createProduct)

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('restaurant', 'admin'), upload.single('image'), updateProduct)
    .delete(protect, authorize('restaurant', 'admin'), deleteProduct)

module.exports = router