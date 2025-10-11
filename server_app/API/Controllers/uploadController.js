const asyncHandler = require('../Middleware/asyncHandler')
const path = require('path')
const fs = require('fs')

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400)
        throw new Error('No file uploaded')
    }

    // Generate file URL
    const fileUrl = `/uploads/${req.file.filename}`

    res.json({
        success: true,
        data: {
            filename: req.file.filename,
            url: fileUrl,
            path: req.file.path,
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
        url: `/uploads/${file.filename}`,
        path: file.path,
    }))

    res.json({
        success: true,
        count: files.length,
        data: files,
    })
})

// @desc    Delete image
// @route   DELETE /api/upload/:filename
// @access  Private (Admin)
const deleteImage = asyncHandler(async (req, res) => {
    const { filename } = req.params

    const filePath = path.join(__dirname, '../../uploads', filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        res.status(404)
        throw new Error('File not found')
    }

    // Delete file
    fs.unlinkSync(filePath)

    res.json({
        success: true,
        message: 'File deleted successfully',
    })
})

module.exports = {
    uploadImage,
    uploadImages,
    deleteImage,
}
