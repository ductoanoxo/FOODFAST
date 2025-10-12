const mongoose = require('mongoose')

const promotionSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
})

// Index for efficient querying
promotionSchema.index({ restaurant: 1, category: 1, isActive: 1 })
promotionSchema.index({ endDate: 1 })

module.exports = mongoose.model('Promotion', promotionSchema)
