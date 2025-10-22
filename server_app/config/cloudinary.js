const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Cloudinary storage for general images
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'foodfast',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
})

// Cloudinary storage for product images
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'foodfast/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
})

// Cloudinary storage for restaurant images
const restaurantStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'foodfast/restaurants',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }],
    },
})

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype) {
        return cb(null, true)
    } else {
        cb(new Error('Only image files are allowed!'))
    }
}

// Upload middleware
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
})

const productUpload = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
})

const restaurantUpload = multer({
    storage: restaurantStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
})

module.exports = {
    cloudinary,
    upload,
    productUpload,
    restaurantUpload,
}
