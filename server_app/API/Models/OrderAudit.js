const mongoose = require('mongoose')

const orderAuditSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    action: { 
        type: String,
        required: true,
    },
    reason: String,
    meta: Object,
}, {
    timestamps: true,
})

module.exports = mongoose.model('OrderAudit', orderAuditSchema)
