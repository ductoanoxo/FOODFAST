const mongoose = require('mongoose')

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
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
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    maxDiscount: {
        type: Number,
        default: null, // Chỉ áp dụng cho percentage
    },
    minOrder: {
        type: Number,
        default: 0,
    },
    maxUsage: {
        type: Number,
        default: null, // null = không giới hạn
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    validFrom: {
        type: Date,
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    userRestriction: {
        type: String,
        enum: ['all', 'new', 'existing'],
        default: 'all',
    },
}, {
    timestamps: true,
})

// Index for faster queries
voucherSchema.index({ code: 1 })
voucherSchema.index({ restaurant: 1 })
voucherSchema.index({ validFrom: 1, validUntil: 1 })

// Method to check if voucher is valid
voucherSchema.methods.isValid = function() {
    const now = new Date()
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.maxUsage === null || this.usageCount < this.maxUsage)
    )
}

// Method to calculate discount
voucherSchema.methods.calculateDiscount = function(orderTotal) {
    if (!this.isValid()) {
        throw new Error('Voucher không hợp lệ hoặc đã hết hạn')
    }
    
    if (orderTotal < this.minOrder) {
        throw new Error(`Đơn hàng tối thiểu ${this.minOrder.toLocaleString('vi-VN')}đ`)
    }
    
    let discount = 0
    if (this.discountType === 'percentage') {
        discount = (orderTotal * this.discountValue) / 100
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount
        }
    } else {
        discount = this.discountValue
    }
    
    return Math.min(discount, orderTotal)
}

module.exports = mongoose.model('Voucher', voucherSchema)
