const asyncHandler = require('../Middleware/asyncHandler')
const { cloudinary } = require('../../config/cloudinary')

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400)
        throw new Error('No file uploaded')
    }

    res.json({
        success: true,
        data: {
            filename: req.file.filename,
            url: req.file.path, // Cloudinary URL
            publicId: req.file.filename,
        },
    })
})

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400)
        throw new Error('No files uploaded')
    }

    const files = req.files.map((file) => ({
        filename: file.filename,
        url: file.path, // Cloudinary URL
        publicId: file.filename,
    }))

    res.json({
        success: true,
        count: files.length,
        data: files,
    })
})

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private (Admin)
const deleteImage = asyncHandler(async (req, res) => {
    const { publicId } = req.params

    try {
        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId)

        if (result.result === 'not found') {
            res.status(404)
            throw new Error('Image not found')
        }

        res.json({
            success: true,
            message: 'Image deleted successfully',
        })
    } catch (error) {
        res.status(500)
        throw new Error('Failed to delete image from Cloudinary')
    }
})

module.exports = {
    uploadImage,
    uploadImages,
    deleteImage,
}
