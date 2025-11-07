const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        appliedPromotion: {
            // Snapshot of promotion applied to this item
            id: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String },
            discountPercent: { type: Number },
            category: { type: String }, // Category name for display
        },
        appliedDiscount: {
            type: {
                type: String,
                enum: ['promotion', 'product_discount', 'none'],
                default: 'none',
            },
            value: { type: Number, default: 0 }, // Discount percentage or amount
            amount: { type: Number, default: 0 }, // Actual discount amount
        },
    }],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    deliveryInfo: {
        name: String,
        phone: String,
        address: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: [Number],
        },
    },
    // Distance between restaurant and delivery address (in km)
    distanceKm: {
        type: Number,
        default: null,
    },
    // Human-readable explanation of how distance/fee was calculated
    distanceExplanation: {
        type: String,
        default: null,
    },
    // Routing method used: 'routing' | 'haversine_adjusted' | 'haversine_fallback'
    routingMethod: {
        type: String,
        enum: ['routing', 'haversine_adjusted', 'haversine_fallback'],
        default: null,
    },
    // Estimated delivery duration in minutes
    estimatedDuration: {
        type: Number,
        default: null,
    },
    // Route geometry from OSRM (GeoJSON LineString)
    routeGeometry: {
        type: {
            type: String,
            enum: ['LineString'],
        },
        coordinates: [[Number]], // Array of [lng, lat] pairs
    },
    note: {
        type: String,
        default: '',
    },
    subtotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        default: 15000,
    },
    discount: {
        type: Number,
        default: 0,
    },
    appliedPromo: {
        // snapshot of the promo object or promo id used for this order
        id: { type: String },
        text: { type: String },
        discountPercent: { type: Number },
        minOrder: { type: Number },
        validUntil: { type: Date },
    },
    appliedPromotions: [{
        // order-level snapshot of promotions applied to any items (unique)
        id: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        discountPercent: { type: Number },
        category: { type: String },
    }],
    appliedVoucher: {
        // Snapshot of the voucher used for this order
        id: { type: mongoose.Schema.Types.ObjectId },
        code: { type: String },
        name: { type: String },
        discountType: { type: String },
        discountValue: { type: Number },
        maxDiscount: { type: Number },
        discountAmount: { type: Number }, // Actual discount amount applied
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'VNPAY', 'MOMO', 'CARD'],
        default: 'COD',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'refund_pending', 'refund_failed'],
        default: 'pending',
    },
    paymentInfo: {
        method: String,
        transactionId: String,
        paidAt: Date,
    },
    refundInfo: {
        status: {
            type: String,
            enum: ['not_applicable', 'pending', 'processing', 'success', 'failed'],
        },
        method: {
            type: String,
            enum: ['vnpay', 'momo', 'manual', 'not_applicable'],
        },
        amount: Number,
        requestedAt: Date,
        processedAt: Date,
        estimatedTime: String,
        message: String,
        transactionId: String,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled'],
        default: 'pending',
    },
    drone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drone',
    },
    confirmedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    pickedUpAt: Date, // Thời điểm nhà hàng xác nhận đã giao cho drone
    pickedUpBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Restaurant user who confirmed the handover
    },
    deliveringAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    estimatedDeliveryTime: Date,
    paidAt: Date,
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    review: String,
}, {
    timestamps: true,
})

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments()
        this.orderNumber = `ORD${Date.now()}${count + 1}`
    }
    next()
})

module.exports = mongoose.model('Order', orderSchema)