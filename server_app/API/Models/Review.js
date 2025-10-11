const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    images: [{
        type: String,
    }],
    isVerified: {
        type: Boolean,
        default: false, // Verified if from actual order
    },
}, {
    timestamps: true,
})

// Prevent duplicate reviews for same product by same user
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
