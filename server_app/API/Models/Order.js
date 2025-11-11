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
        coordinates: [
            [Number]
        ], // Array of [lng, lat] pairs
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
        enum: ['pending', 'paid', 'failed', 'refunded', 'refund_pending'],
        default: 'pending',
    },
    paymentInfo: {
        method: String,
        transactionId: String,
        paidAt: Date,
        errorCode: String,
        errorMessage: String,
        transactionStatus: String,
        failedAt: Date,
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
        enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'picked_up',
            'delivering',
            'arrived_at_location', // Drone đã đến nơi
            'waiting_for_customer', // Đợi khách nhận (5 phút)
            'delivered', // Giao thành công
            'delivery_failed', // Không gặp khách
            'returning_to_restaurant', // Drone đang quay lại
            'returned', // Đã trả lại nhà hàng
            'cancelled'
        ],
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
    arrivedAt: Date, // Thời điểm drone đến nơi
    waitingStartedAt: Date, // Bắt đầu đếm timeout
    waitingEndedAt: Date, // Kết thúc waiting (nhận hàng hoặc timeout)
    deliveredAt: Date,
    deliveryFailedAt: Date, // Thời điểm không gặp khách
    returningAt: Date, // Bắt đầu quay lại
    returnedAt: Date, // Đã trả lại nhà hàng
    cancelledAt: Date,
    cancelReason: String,
    deliveryAttempts: { // Số lần thử giao hàng
        type: Number,
        default: 0
    },
    customerNotification: { // Thông báo đã gửi cho khách
        sentAt: Date,
        method: String, // 'sms', 'push', 'call'
    },
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

// Add indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ restaurant: 1, status: 1 })
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ drone: 1 })

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        // Use a more efficient approach: timestamp + random for uniqueness
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        this.orderNumber = `ORD${timestamp}${random}`
    }
    next()
})

module.exports = mongoose.model('Order', orderSchema)