const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../Middleware/authMiddleware')
const { upload } = require('../../config/cloudinary')
const {
    uploadImage,
    uploadImages,
    deleteImage,
} = require('../Controllers/uploadController')

// Upload single image
router.post('/image', protect, upload.single('image'), uploadImage)

// Upload multiple images
router.post('/images', protect, upload.array('images', 10), uploadImages)

// Delete image
router.delete('/:publicId', protect, authorize('admin'), deleteImage)

module.exports = router