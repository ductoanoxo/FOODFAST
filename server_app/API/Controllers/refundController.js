const asyncHandler = require('../Middleware/asyncHandler')
const Order = require('../Models/Order')
const OrderAudit = require('../Models/OrderAudit')

// @desc    Get all refund requests
// @route   GET /api/refunds
// @access  Private (Admin only)
const getRefundRequests = asyncHandler(async (req, res) => {
    const { status, paymentStatus, search } = req.query

    let query = {
        status: 'cancelled',
    }

    // Filter by refund status
    if (status && status !== 'all') {
        query['refundInfo.status'] = status
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== 'all') {
        query.paymentStatus = paymentStatus
    }

    // Search by order number or customer name
    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
        ]
    }

    const refundRequests = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('restaurant', 'name')
        .sort('-cancelledAt')
        .limit(100)

    res.json({
        success: true,
        count: refundRequests.length,
        data: refundRequests,
    })
})

// @desc    Process manual refund (mark as refunded)
// @route   POST /api/refunds/:orderId/process
// @access  Private (Admin only)
const processManualRefund = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const { transactionId, notes, method } = req.body

    const order = await Order.findById(orderId)
        .populate('user', 'name email phone')

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    if (order.status !== 'cancelled') {
        res.status(400)
        throw new Error('Only cancelled orders can be refunded')
    }

    if (order.paymentStatus === 'refunded') {
        res.status(400)
        throw new Error('This order has already been refunded')
    }

    // Update payment status and refund info
    order.paymentStatus = 'refunded'
    
    const now = new Date()
    order.refundInfo = {
        ...order.refundInfo?.toObject?.() || order.refundInfo || {},
        status: 'success',
        method: method || 'manual',
        processedAt: now,
        transactionId: transactionId || `MANUAL_${Date.now()}`,
        message: notes || 'Đã hoàn tiền thủ công bởi Admin',
    }

    if (!order.refundInfo.requestedAt) {
        order.refundInfo.requestedAt = order.cancelledAt || now
    }

    if (!order.refundInfo.amount) {
        order.refundInfo.amount = order.totalAmount
    }

    await order.save()

    // Create audit log
    await OrderAudit.create({
        order: order._id,
        user: req.user._id,
        action: 'manual_refund_completed',
        reason: notes || 'Admin processed manual refund',
        meta: {
            processedBy: req.user.email || req.user.name,
            transactionId: order.refundInfo.transactionId,
            amount: order.refundInfo.amount,
            method: order.refundInfo.method,
        },
    })

    res.json({
        success: true,
        message: 'Refund processed successfully',
        data: order,
    })
})

// @desc    Get refund statistics
// @route   GET /api/refunds/stats
// @access  Private (Admin only)
const getRefundStats = asyncHandler(async (req, res) => {
    const totalRefunds = await Order.countDocuments({
        status: 'cancelled',
        paymentStatus: { $in: ['refunded', 'refund_pending', 'refund_failed'] },
    })

    const pendingRefunds = await Order.countDocuments({
        status: 'cancelled',
        paymentStatus: { $in: ['refund_pending', 'refund_failed'] },
    })

    const completedRefunds = await Order.countDocuments({
        status: 'cancelled',
        paymentStatus: 'refunded',
    })

    const failedRefunds = await Order.countDocuments({
        status: 'cancelled',
        paymentStatus: 'refund_failed',
    })

    // Calculate total refund amount
    const refundAmountResult = await Order.aggregate([
        {
            $match: {
                status: 'cancelled',
                paymentStatus: 'refunded',
            },
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$totalAmount' },
            },
        },
    ])

    const totalRefundAmount = refundAmountResult.length > 0 ? refundAmountResult[0].totalAmount : 0

    res.json({
        success: true,
        data: {
            total: totalRefunds,
            pending: pendingRefunds,
            completed: completedRefunds,
            failed: failedRefunds,
            totalRefundAmount,
        },
    })
})

// @desc    Get refund audit logs
// @route   GET /api/refunds/:orderId/logs
// @access  Private (Admin only)
const getRefundLogs = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const logs = await OrderAudit.find({ order: orderId })
        .populate('user', 'name email role')
        .sort('-createdAt')

    res.json({
        success: true,
        count: logs.length,
        data: logs,
    })
})

module.exports = {
    getRefundRequests,
    processManualRefund,
    getRefundStats,
    getRefundLogs,
}
