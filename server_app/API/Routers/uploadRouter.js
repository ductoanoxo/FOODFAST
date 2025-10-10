const express = require('express')
const router = express.Router()
const multer = require('multer')
const { protect } = require('../Middleware/authMiddleware')

const upload = multer({ dest: 'uploads/' })

// Upload image
router.post('/', protect, upload.single('file'), (req, res) => {
    // TODO: Implement Cloudinary upload
    res.json({
        success: true,
        data: {
            url: 'https://via.placeholder.com/300',
            message: 'Image upload integration coming soon',
        },
    })
})

module.exports = router