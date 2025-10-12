const mongoose = require('mongoose')

const promoUsageSchema = new mongoose.Schema({
    promoId: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    usedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
})

// Ensure a user can only have one usage record per promo
promoUsageSchema.index({ promoId: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('PromoUsage', promoUsageSchema)
