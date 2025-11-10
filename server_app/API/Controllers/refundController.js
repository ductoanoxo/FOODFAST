const asyncHandler = require('../Middleware/asyncHandler')
const Order = require('../Models/Order')
const OrderAudit = require('../Models/OrderAudit')

// @desc    Get all refund requests
// @route   GET /api/refunds
// @access  Private (Admin only)
const getRefundRequests = asyncHandler(async (req, res) => {
    const { status, paymentStatus, search, page = 1, limit = 10 } = req.query

    // Build query với $and để combine nhiều điều kiện
    let query = {
        $and: [
            { status: 'cancelled' },
            // Loại bỏ các đơn VNPay/MoMo chưa thanh toán (không cần hoàn tiền)
            {
                $or: [
                    { paymentMethod: 'COD' }, // COD luôn hiển thị
                    { paymentStatus: 'paid' }, // Đã thanh toán thì hiển thị
                    { paymentStatus: 'refund_pending' }, // Đang chờ hoàn tiền thì hiển thị
                    { paymentStatus: 'refunded' }, // Đã hoàn tiền thì hiển thị
                ]
            }
        ]
    }

    // Filter by refund status
    if (status && status !== 'all') {
        query.$and.push({ 'refundInfo.status': status })
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== 'all') {
        query.$and.push({ paymentStatus: paymentStatus })
    }

    // Search by order number or customer name
    if (search) {
        query.$and.push({
            orderNumber: { $regex: search, $options: 'i' }
        })
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Order.countDocuments(query)

    const refundRequests = await Order.find(query)
        .select('orderNumber user totalAmount paymentMethod paymentStatus refundInfo cancelledAt cancelReason createdAt')
        .populate('user', 'name email phone')
        .sort('-cancelledAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean() // Convert to plain JS objects for better performance

    res.json({
        success: true,
        count: refundRequests.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: refundRequests,
    })
})

// @desc    Process manual refund (xác nhận hoàn tiền và tự động gọi API nếu cần)
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

    const now = new Date()

    // Nếu phương thức là vnpay/momo thì tự động gọi API
    if (method === 'vnpay' && order.paymentInfo?.method === 'vnpay') {
        try {
            const crypto = require('crypto')
            const moment = require('moment')
            const axios = require('axios')

            const vnpApi = process.env.VNPAY_API || null
            const vnpTmn = process.env.VNPAY_TMN_CODE || null
            const vnpHash = process.env.VNPAY_HASH_SECRET || null

            if (!vnpApi || !vnpTmn || !vnpHash) {
                throw new Error('VNPay configuration is missing')
            }

            const vnp_RequestId = moment(now).format('HHmmss')
            const vnp_Version = '2.1.0'
            const vnp_Command = 'refund'
            const vnp_TxnRef = order.paymentInfo.transactionId
            const vnp_TransactionDate = order.paidAt ? moment(order.paidAt).format('YYYYMMDDHHmmss') : moment().format('YYYYMMDDHHmmss')
            const vnp_Amount = Math.round((order.totalAmount || 0) * 100)
            const vnp_TransactionType = '02'
            const vnp_CreateBy = req.user.email || String(req.user._id)
            const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef
            const vnp_IpAddr = '127.0.0.1'
            const vnp_CreateDate = moment(now).format('YYYYMMDDHHmmss')
            const vnp_TransactionNo = '0'

            const data = vnp_RequestId + '|' + vnp_Version + '|' + vnp_Command + '|' + vnpTmn + '|' + vnp_TransactionType + '|' + vnp_TxnRef + '|' + vnp_Amount + '|' + vnp_TransactionNo + '|' + vnp_TransactionDate + '|' + vnp_CreateBy + '|' + vnp_CreateDate + '|' + vnp_IpAddr + '|' + vnp_OrderInfo
            const hmac = crypto.createHmac('sha512', vnpHash)
            const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex')

            const payload = {
                vnp_RequestId,
                vnp_Version,
                vnp_Command,
                vnp_TmnCode: vnpTmn,
                vnp_TransactionType: vnp_TransactionType,
                vnp_TxnRef,
                vnp_Amount,
                vnp_TransactionNo,
                vnp_CreateBy,
                vnp_OrderInfo,
                vnp_TransactionDate,
                vnp_CreateDate,
                vnp_IpAddr,
                vnp_SecureHash,
            }

            const resp = await axios.post(vnpApi, payload)

            // Verify signature
            let isValidSignature = false
            if (resp && resp.data && resp.data.vnp_SecureHash) {
                try {
                    const {
                        vnp_ResponseId,
                        vnp_Command,
                        vnp_ResponseCode,
                        vnp_Message,
                        vnp_TmnCode,
                        vnp_TxnRef,
                        vnp_Amount,
                        vnp_BankCode,
                        vnp_PayDate,
                        vnp_TransactionNo,
                        vnp_TransactionType,
                        vnp_TransactionStatus,
                        vnp_OrderInfo,
                        vnp_SecureHash
                    } = resp.data

                    const signData = vnp_ResponseId + '|' + vnp_Command + '|' + vnp_ResponseCode + '|' + vnp_Message + '|' + vnp_TmnCode + '|' + vnp_TxnRef + '|' + vnp_Amount + '|' + vnp_BankCode + '|' + vnp_PayDate + '|' + vnp_TransactionNo + '|' + vnp_TransactionType + '|' + vnp_TransactionStatus + '|' + vnp_OrderInfo
                    const hmacCheck = crypto.createHmac('sha512', vnpHash)
                    const computedHash = hmacCheck.update(Buffer.from(signData, 'utf-8')).digest('hex')
                    isValidSignature = computedHash === vnp_SecureHash
                } catch (signErr) {
                    console.error('Failed to verify VNPay refund signature', signErr)
                    isValidSignature = false
                }
            }

            const isSuccess = resp && resp.data && resp.data.vnp_ResponseCode === '00'

            if (isSuccess) {
                order.paymentStatus = 'refunded'
                order.refundInfo = {
                    ...order.refundInfo?.toObject?.() || order.refundInfo || {},
                    status: 'success',
                    method: 'vnpay',
                    processedAt: now,
                    transactionId: resp.data.vnp_TransactionNo || vnp_RequestId,
                    message: 'Đã hoàn tiền qua VNPay thành công. Tiền sẽ về tài khoản trong 3-7 ngày làm việc',
                    estimatedTime: '3-7 ngày làm việc',
                    bankCode: resp.data.vnp_BankCode || '',
                    adminNote: notes || 'Admin xác nhận hoàn tiền qua VNPay',
                }

                await order.save()

                await OrderAudit.create({
                    order: order._id,
                    user: req.user._id,
                    action: 'auto_refund_completed',
                    reason: 'Admin xác nhận - Hoàn tiền tự động qua VNPay',
                    meta: {
                        processedBy: req.user.email || req.user.name,
                        response: resp.data,
                        signatureValid: isValidSignature,
                        vnpayResponseCode: resp.data.vnp_ResponseCode,
                        vnpayMessage: resp.data.vnp_Message,
                        notes: notes
                    },
                })

                return res.json({
                    success: true,
                    message: 'Hoàn tiền tự động qua VNPay thành công',
                    data: order,
                })
            } else {
                // VNPay API failed
                throw new Error(`VNPay API failed: ${resp?.data?.vnp_Message || 'Unknown error'}`)
            }
        } catch (vnpayError) {
            console.error('VNPay refund error:', vnpayError)
            // Nếu VNPay fail, vẫn cho phép admin xác nhận thủ công
            // Nhưng thông báo lỗi
            return res.status(500).json({
                success: false,
                message: 'Không thể hoàn tiền tự động qua VNPay. Vui lòng chọn phương thức thủ công',
                error: vnpayError.message
            })
        }
    }

    // Xử lý thủ công (manual, momo, cash, bank transfer)
    order.paymentStatus = 'refunded'
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
        reason: notes || 'Admin xác nhận hoàn tiền thủ công',
        meta: {
            processedBy: req.user.email || req.user.name,
            transactionId: order.refundInfo.transactionId,
            amount: order.refundInfo.amount,
            method: order.refundInfo.method,
        },
    })

    res.json({
        success: true,
        message: 'Đã xác nhận hoàn tiền thành công',
        data: order,
    })
})

// @desc    Get refund statistics
// @route   GET /api/refunds/stats
// @access  Private (Admin only)
const getRefundStats = asyncHandler(async (req, res) => {
    // Query để loại bỏ VNPay/MoMo chưa thanh toán
    const baseQuery = {
        status: 'cancelled',
        $or: [
            { paymentMethod: 'COD' },
            { paymentStatus: 'paid' },
            { paymentStatus: 'refund_pending' },
            { paymentStatus: 'refunded' },
        ]
    }

    const totalRefunds = await Order.countDocuments({
        ...baseQuery,
        paymentStatus: { $in: ['refunded', 'refund_pending'] },
    })

    const pendingRefunds = await Order.countDocuments({
        ...baseQuery,
        paymentStatus: 'refund_pending',
    })

    const completedRefunds = await Order.countDocuments({
        ...baseQuery,
        paymentStatus: 'refunded',
    })

    // Calculate total refund amount
    const refundAmountResult = await Order.aggregate([
        {
            $match: {
                status: 'cancelled',
                paymentStatus: 'refunded',
                $or: [
                    { paymentMethod: 'COD' },
                    { paymentStatus: 'paid' },
                    { paymentStatus: 'refund_pending' },
                    { paymentStatus: 'refunded' },
                ]
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
