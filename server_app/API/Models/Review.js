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
    restaurantReply: {
        type: String,
        default: '',
    },
    repliedAt: {
        type: Date,
    },
}, {
    timestamps: true,
})

// Index để tìm kiếm nhanh (không unique - cho phép nhiều review)
reviewSchema.index({ user: 1, product: 1 })

module.exports = mongoose.model('Review', reviewSchema)
