const mongoose = require('mongoose')

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categories: [{
        type: String,
    }],
    address: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: false,
            default: [106.6297, 10.8231], // Default: Ho Chi Minh City center
        },
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    openingHours: {
        type: String,
        default: '8:00 - 22:00',
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    deliveryTime: {
        type: String,
        default: '20-30',
    },
    promo: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        // Có thể là string (backward compatible) hoặc object:
        // { text: String, discountPercent: Number, validUntil: Date, minOrder: Number }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
})

restaurantSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Restaurant', restaurantSchema)