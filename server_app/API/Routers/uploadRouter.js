const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { protect, authorize } = require('../Middleware/authMiddleware')
const {
    uploadImage,
    uploadImages,
    deleteImage,
} = require('../Controllers/uploadController')

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

// Upload single image
router.post('/image', protect, upload.single('image'), uploadImage)

// Upload multiple images
router.post('/images', protect, upload.array('images', 10), uploadImages)

// Delete image
router.delete('/:filename', protect, authorize('admin'), deleteImage)

module.exports = router