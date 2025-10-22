const cloudinary = require('cloudinary').v2
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Common file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype) {
        return cb(null, true)
    } else {
        cb(new Error('Only image files are allowed!'))
    }
}

// Use multer memory storage to get file buffer
const memory = multer.memoryStorage()

const baseMulter = multer({
    storage: memory,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
})

// Helper to upload buffer to Cloudinary and attach result to req.file
function uploadToCloudinary(folder, transformation = []) {
    return async (req, res, next) => {
        try {
            if (!req.file) return next()

            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder, transformation },
                        (error, result) => {
                            if (error) return reject(error)
                            resolve(result)
                        }
                    )
                    stream.end(buffer)
                })
            }

            const result = await streamUpload(req.file.buffer)

            // normalize to existing code expectations: req.file.path
            req.file.path = result.secure_url || result.url
            req.file.filename = result.public_id
            req.file.cloudinary = result

            next()
        } catch (err) {
            next(err)
        }
    }
}

// Create multer-like wrappers that provide .single(field) so existing code
// which calls productUpload.single('image') continues to work.
function makeUploader(folder, transformation) {
    return {
        single: (fieldName) => {
            // Return an array of middlewares: multer.single then uploadToCloudinary
            const m = baseMulter.single(fieldName)
            const u = uploadToCloudinary(folder, transformation)
            // Express accepts arrays of middleware when passed with spread or directly as argument;
            // but routers usually call `productUpload.single('image')` which must return a function or array.
            // Returning a function that runs both in sequence is safest.
            return (req, res, next) => {
                m(req, res, function (err) {
                    if (err) return next(err)
                    u(req, res, next)
                })
            }
        },
        // Provide .array and .fields if needed in future
        array: (fieldName, maxCount) => {
            const m = baseMulter.array(fieldName, maxCount)
            const u = uploadToCloudinary(folder, transformation)
            return (req, res, next) => {
                m(req, res, function (err) {
                    if (err) return next(err)
                    // For arrays we won't automatically upload multiple files here; keep simple for now
                    next()
                })
            }
        },
    }
}

const upload = makeUploader('foodfast', [{ width: 1000, height: 1000, crop: 'limit' }])
const productUpload = makeUploader('foodfast/products', [{ width: 800, height: 800, crop: 'limit' }])
const restaurantUpload = makeUploader('foodfast/restaurants', [{ width: 1200, height: 800, crop: 'limit' }])

module.exports = {
    cloudinary,
    upload,
    productUpload,
    restaurantUpload,
}
