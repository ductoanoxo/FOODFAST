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
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
        default: 'pending',
    },
    drone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drone',
    },
    confirmedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    deliveringAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    estimatedDeliveryTime: Date,
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