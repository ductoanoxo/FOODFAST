const mongoose = require('mongoose')

const voucherUsageSchema = new mongoose.Schema({
    voucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    usedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
})

// Ensure a user can only use a voucher once
voucherUsageSchema.index({ voucher: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('VoucherUsage', voucherUsageSchema)
