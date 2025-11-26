const asyncHandler = require('../Middleware/asyncHandler')
const crypto = require('crypto')
const querystring = require('qs')
const moment = require('moment')

// Auto-detect base URL based on environment
const getBaseUrl = () => {
    if (process.env.VNPAY_RETURN_URL) {
        return process.env.VNPAY_RETURN_URL
    }
    // Use CLIENT_URL if available, otherwise detect from NODE_ENV
    if (process.env.CLIENT_URL) {
        return process.env.CLIENT_URL + '/payment/vnpay/return'
    }
    // Production server
    if (process.env.NODE_ENV === 'production') {
        return 'http://54.91.2.188:3000/payment/vnpay/return'
    }
    // Local development
    return 'http://localhost:3000/payment/vnpay/return'
}

// VNPay Configuration
const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'SVUPM77I',
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'PGN8FTCJ7F18Z7IZVM1SLFOMFEA1RDQQ',
    vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: getBaseUrl(),
    vnp_Api: process.env.VNPAY_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
}

// @desc    Create VNPay payment URL
// @route   POST /api/payment/vnpay/create
// @access  Private
const createVNPayPayment = asyncHandler(async (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    
    const { orderId, amount, orderInfo, bankCode } = req.body
    const Order = require('../Models/Order')

    const order = await Order.findById(orderId)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized')
    }

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

    const vnp_TxnRef = moment(date).format('DDHHmmss')
    const locale = 'vn'
    const currCode = 'VND'

    let vnp_Params = {}
    vnp_Params['vnp_Version'] = '2.1.0'
    vnp_Params['vnp_Command'] = 'pay'
    vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode
    vnp_Params['vnp_Locale'] = locale
    vnp_Params['vnp_CurrCode'] = currCode
    vnp_Params['vnp_TxnRef'] = vnp_TxnRef
    vnp_Params['vnp_OrderInfo'] = orderInfo || 'Thanh toan cho ma GD:' + vnp_TxnRef
    vnp_Params['vnp_OrderType'] = 'other'
    vnp_Params['vnp_Amount'] = amount * 100
    vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl
    vnp_Params['vnp_IpAddr'] = ipAddr
    vnp_Params['vnp_CreateDate'] = createDate
    if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
        vnp_Params['vnp_BankCode'] = bankCode
    }

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed

    const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false })

    // Update order with payment info
    order.paymentInfo = {
        method: 'vnpay',
        transactionId: vnp_TxnRef,
    }
    await order.save()

    res.json({
        success: true,
        data: {
            paymentUrl,
            transactionId: vnp_TxnRef,
        },
    })
})

// @desc    VNPay return/callback
// @route   GET /api/payment/vnpay/return
// @access  Public
const vnpayReturn = asyncHandler(async (req, res) => {
    let vnp_Params = req.query

    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash === signed) {
        // Kiểm tra xem dữ liệu trong db có hợp lệ hay không và thông báo kết quả
        const Order = require('../Models/Order')

        // Find order by transaction ID
        const order = await Order.findOne({
            'paymentInfo.transactionId': vnp_Params['vnp_TxnRef'],
        })

        if (order) {
            // Bảng mã lỗi VNPay đầy đủ
            const getVNPayErrorMessage = (responseCode) => {
                const errorMessages = {
                    // vnp_ResponseCode - Return URL & IPN
                    '00': 'Giao dịch thành công',
                    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
                    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
                    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
                    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
                    '13': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
                    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
                    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
                    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
                    '75': 'Ngân hàng thanh toán đang bảo trì.',
                    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
                    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
                    
                    // Tra cứu giao dịch (querydr)
                    '02': 'Merchant không hợp lệ (kiểm tra lại vnp_TmnCode)',
                    '03': 'Dữ liệu gửi sang không đúng định dạng',
                    '91': 'Không tìm thấy giao dịch yêu cầu',
                    '94': 'Yêu cầu bị trùng lặp trong thời gian giới hạn của API (Giới hạn trong 5 phút)',
                    '97': 'Chữ ký không hợp lệ',
                    '98': 'Timeout Exception',
                    
                    // Hoàn trả (refund)
                    '04': 'Không cho phép hoàn trả toàn phần sau khi hoàn trả một phần',
                    '13': 'Chỉ cho phép hoàn trả một phần',
                    '93': 'Số tiền hoàn trả không hợp lệ. Số tiền hoàn trả phải nhỏ hơn hoặc bằng số tiền thanh toán.',
                    '95': 'Giao dịch này không thành công bên VNPAY. VNPAY từ chối xử lý yêu cầu.',
                }
                return errorMessages[responseCode] || `Lỗi không xác định (Mã lỗi: ${responseCode})`
            }

            const getTransactionStatusMessage = (transactionStatus) => {
                const statusMessages = {
                    '00': 'Giao dịch thành công',
                    '01': 'Giao dịch chưa hoàn tất',
                    '02': 'Giao dịch bị lỗi',
                    '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
                    '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
                    '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
                    '07': 'Giao dịch bị nghi ngờ gian lận',
                    '09': 'GD Hoàn trả bị từ chối',
                }
                return statusMessages[transactionStatus] || null
            }

            // Nếu là payment return (user redirected), cập nhật trạng thái đơn tương ứng
            try {
                if (vnp_Params['vnp_ResponseCode'] === '00') {
                    // Thanh toán thành công: chỉ cập nhật trạng thái thanh toán, KHÔNG tự động đổi trạng thái đơn.
                    // Lý do: trạng thái xử lý đơn (confirmed/preparing/ready...) nên do nhà hàng hoặc luồng nghiệp vụ quyết định.
                    order.paymentStatus = 'paid'
                    order.paidAt = new Date()
                    
                    // Xóa error message nếu có
                    if (order.paymentInfo) {
                        order.paymentInfo.errorMessage = undefined
                        order.paymentInfo.errorCode = undefined
                        order.paymentInfo.transactionStatus = undefined
                    }

                    await order.save()

                    // Emit socket cập nhật trạng thái (bao gồm paymentStatus) để frontend/restaurant cập nhật view
                    try {
                        const io = req.app.get('io')
                        const now = new Date()
                        const payload = {
                            orderId: order._id,
                            orderNumber: order.orderNumber,
                            status: order.status,
                            paymentStatus: order.paymentStatus,
                            timestamp: now,
                        }
                        if (io) {
                            io.to(`order-${order._id}`).emit('order:status-updated', payload)
                            io.to(`order-${order._id}`).emit('order-status-updated', payload)
                            io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant })
                            io.to(`restaurant-${order.restaurant}`).emit('order-status-updated', {...payload, restaurantId: order.restaurant })
                        }
                    } catch (emitErr) {
                        console.error('Failed to emit order status update after return:', emitErr)
                    }
                } else {
                    // Thanh toán thất bại: cập nhật trạng thái đơn hàng thành cancelled
                    const errorMessage = getVNPayErrorMessage(vnp_Params['vnp_ResponseCode'])
                    const transactionStatus = vnp_Params['vnp_TransactionStatus']
                    const transactionStatusMessage = getTransactionStatusMessage(transactionStatus)
                    
                    // Tạo thông báo lỗi đầy đủ
                    let fullErrorMessage = errorMessage
                    if (transactionStatusMessage) {
                        fullErrorMessage += `\nTrạng thái giao dịch: ${transactionStatusMessage}`
                    }
                    
                    order.status = 'cancelled'
                    order.paymentStatus = 'failed'
                    order.cancelledAt = new Date()
                    
                    // Lưu thông tin lỗi chi tiết vào paymentInfo
                    if (!order.paymentInfo) {
                        order.paymentInfo = {}
                    }
                    order.paymentInfo.errorCode = vnp_Params['vnp_ResponseCode']
                    order.paymentInfo.errorMessage = fullErrorMessage
                    order.paymentInfo.transactionStatus = transactionStatus
                    order.paymentInfo.failedAt = new Date()

                    await order.save()

                    // Emit socket cập nhật trạng thái
                    try {
                        const io = req.app.get('io')
                        const now = new Date()
                        const payload = {
                            orderId: order._id,
                            orderNumber: order.orderNumber,
                            status: order.status,
                            paymentStatus: order.paymentStatus,
                            timestamp: now,
                            errorMessage: errorMessage,
                        }
                        if (io) {
                            io.to(`order-${order._id}`).emit('order:status-updated', payload)
                            io.to(`order-${order._id}`).emit('order-status-updated', payload)
                            io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant })
                            io.to(`restaurant-${order.restaurant}`).emit('order-status-updated', {...payload, restaurantId: order.restaurant })
                            
                            // 🚁 If order has drone assigned, trigger return to home animation
                            if (order.drone) {
                                const Drone = require('../Models/Drone')
                                const drone = await Drone.findById(order.drone)
                                if (drone && drone.homeLocation) {
                                    io.to(`order-${order._id}`).emit('drone:returning-home', {
                                        orderId: order._id,
                                        droneId: drone._id,
                                        droneName: drone.name,
                                        currentLocation: drone.currentLocation,
                                        homeLocation: drone.homeLocation,
                                        estimatedDuration: 5,
                                        timestamp: new Date()
                                    })
                                    console.log(`🚁 Emitted drone:returning-home for payment failed order ${order._id}`)
                                    
                                    // Update drone status
                                    drone.status = 'returning'
                                    drone.currentOrder = null
                                    await drone.save()
                                }
                            }
                        }
                    } catch (emitErr) {
                        console.error('Failed to emit order status update after payment failure:', emitErr)
                    }
                }
            } catch (err) {
                console.error('Error updating order on vnpayReturn:', err)
            }

            res.json({
                success: vnp_Params['vnp_ResponseCode'] === '00',
                code: vnp_Params['vnp_ResponseCode'],
                message: vnp_Params['vnp_ResponseCode'] === '00' ? 'Payment successful' : getVNPayErrorMessage(vnp_Params['vnp_ResponseCode']),
                data: {
                    orderId: order._id,
                    transactionId: vnp_Params['vnp_TxnRef'],
                    amount: vnp_Params['vnp_Amount'] / 100,
                    responseCode: vnp_Params['vnp_ResponseCode'],
                    errorMessage: vnp_Params['vnp_ResponseCode'] !== '00' ? getVNPayErrorMessage(vnp_Params['vnp_ResponseCode']) : undefined,
                }
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found',
                code: '01'
            })
        }
    } else {
        res.status(400).json({
            success: false,
            message: 'Invalid signature',
            code: '97'
        })
    }
})

// @desc    VNPay IPN (Instant Payment Notification)
// @route   GET /api/payment/vnpay/ipn
// @access  Public
const vnpayIPN = asyncHandler(async (req, res) => {
    let vnp_Params = req.query
    const secureHash = vnp_Params['vnp_SecureHash']

    const orderId = vnp_Params['vnp_TxnRef']
    const rspCode = vnp_Params['vnp_ResponseCode']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    const Order = require('../Models/Order')

    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch
    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amount/100" trùng khớp với số tiền của đơn hàng

    if (secureHash === signed) {
        // Kiểm tra checksum
        const order = await Order.findOne({
            'paymentInfo.transactionId': orderId,
        })

        if (order) {
            checkOrderId = true
            // Kiểm tra số tiền
            const amount = vnp_Params['vnp_Amount'] / 100
            if (amount === order.totalAmount) {
                checkAmount = true
                if (order.paymentStatus === 'pending') {
                    // Kiểm tra tình trạng giao dịch trước khi cập nhật
                    if (rspCode === '00') {
                        // Thanh toán thành công: chỉ cập nhật paymentStatus
                        order.paymentStatus = 'paid'
                        order.paidAt = new Date()
                        
                        // Xóa error message nếu có
                        if (order.paymentInfo) {
                            order.paymentInfo.errorMessage = undefined
                            order.paymentInfo.errorCode = undefined
                        }

                        await order.save()

                        // Emit socket cập nhật trạng thái (bao gồm paymentStatus)
                        try {
                            const io = req.app.get('io')
                            const now = new Date()
                            const payload = {
                                orderId: order._id,
                                orderNumber: order.orderNumber,
                                status: order.status,
                                paymentStatus: order.paymentStatus,
                                timestamp: now,
                            }
                            if (io) {
                                io.to(`order-${order._id}`).emit('order:status-updated', payload)
                                io.to(`order-${order._id}`).emit('order-status-updated', payload)
                                io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant })
                                io.to(`restaurant-${order.restaurant}`).emit('order-status-updated', {...payload, restaurantId: order.restaurant })
                            }
                        } catch (emitErr) {
                            console.error('Failed to emit order status update after IPN:', emitErr)
                        }

                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    } else {
                        // Thanh toán thất bại: cập nhật trạng thái đơn hàng thành cancelled
                        const getVNPayErrorMessage = (responseCode) => {
                            const errorMessages = {
                                // vnp_ResponseCode - Return URL & IPN
                                '00': 'Giao dịch thành công',
                                '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                                '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
                                '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
                                '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
                                '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
                                '13': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
                                '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
                                '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
                                '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
                                '75': 'Ngân hàng thanh toán đang bảo trì.',
                                '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
                                '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
                                
                                // Tra cứu giao dịch (querydr)
                                '02': 'Merchant không hợp lệ (kiểm tra lại vnp_TmnCode)',
                                '03': 'Dữ liệu gửi sang không đúng định dạng',
                                '91': 'Không tìm thấy giao dịch yêu cầu',
                                '94': 'Yêu cầu bị trùng lặp trong thời gian giới hạn của API (Giới hạn trong 5 phút)',
                                '97': 'Chữ ký không hợp lệ',
                                '98': 'Timeout Exception',
                                
                                // Hoàn trả (refund)
                                '04': 'Không cho phép hoàn trả toàn phần sau khi hoàn trả một phần',
                                '13': 'Chỉ cho phép hoàn trả một phần',
                                '93': 'Số tiền hoàn trả không hợp lệ. Số tiền hoàn trả phải nhỏ hơn hoặc bằng số tiền thanh toán.',
                                '95': 'Giao dịch này không thành công bên VNPAY. VNPAY từ chối xử lý yêu cầu.',
                            }
                            return errorMessages[responseCode] || `Lỗi không xác định (Mã lỗi: ${responseCode})`
                        }

                        const getTransactionStatusMessage = (transactionStatus) => {
                            const statusMessages = {
                                '00': 'Giao dịch thành công',
                                '01': 'Giao dịch chưa hoàn tất',
                                '02': 'Giao dịch bị lỗi',
                                '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
                                '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
                                '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
                                '07': 'Giao dịch bị nghi ngờ gian lận',
                                '09': 'GD Hoàn trả bị từ chối',
                            }
                            return statusMessages[transactionStatus] || null
                        }
                        
                        const errorMessage = getVNPayErrorMessage(rspCode)
                        const transactionStatus = vnp_Params['vnp_TransactionStatus']
                        const transactionStatusMessage = getTransactionStatusMessage(transactionStatus)
                        
                        // Tạo thông báo lỗi đầy đủ
                        let fullErrorMessage = errorMessage
                        if (transactionStatusMessage) {
                            fullErrorMessage += `\nTrạng thái giao dịch: ${transactionStatusMessage}`
                        }
                        
                        order.status = 'cancelled'
                        order.paymentStatus = 'failed'
                        order.cancelledAt = new Date()
                        
                        // Lưu thông tin lỗi chi tiết vào paymentInfo
                        if (!order.paymentInfo) {
                            order.paymentInfo = {}
                        }
                        order.paymentInfo.errorCode = rspCode
                        order.paymentInfo.errorMessage = fullErrorMessage
                        order.paymentInfo.transactionStatus = transactionStatus
                        order.paymentInfo.failedAt = new Date()
                        
                        await order.save()
                        
                        // Emit socket cập nhật trạng thái
                        try {
                            const io = req.app.get('io')
                            const now = new Date()
                            const payload = {
                                orderId: order._id,
                                orderNumber: order.orderNumber,
                                status: order.status,
                                paymentStatus: order.paymentStatus,
                                timestamp: now,
                                errorMessage: fullErrorMessage,
                            }
                            if (io) {
                                io.to(`order-${order._id}`).emit('order:status-updated', payload)
                                io.to(`order-${order._id}`).emit('order-status-updated', payload)
                                io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant })
                                io.to(`restaurant-${order.restaurant}`).emit('order-status-updated', {...payload, restaurantId: order.restaurant })
                            }
                        } catch (emitErr) {
                            console.error('Failed to emit order status update after IPN payment failure:', emitErr)
                        }
                        
                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    }
                } else {
                    res.status(200).json({
                        RspCode: '02',
                        Message: 'This order has been updated to the payment status',
                    })
                }
            } else {
                checkAmount = false
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
            }
        } else {
            checkOrderId = false
            res.status(200).json({ RspCode: '01', Message: 'Order not found' })
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
    }
})

// @desc    Query VNPay transaction
// @route   POST /api/payment/vnpay/querydr
// @access  Private
const queryVNPayTransaction = asyncHandler(async (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    const date = new Date()

    const { orderId, transDate } = req.body

    const vnp_RequestId = moment(date).format('HHmmss')
    const vnp_Version = '2.1.0'
    const vnp_Command = 'querydr'
    const vnp_TmnCode = vnpayConfig.vnp_TmnCode
    const vnp_TxnRef = orderId
    const vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef
    const vnp_TransactionDate = transDate

    const vnp_IpAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

    const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss')

    const data =
        vnp_RequestId +
        '|' +
        vnp_Version +
        '|' +
        vnp_Command +
        '|' +
        vnp_TmnCode +
        '|' +
        vnp_TxnRef +
        '|' +
        vnp_TransactionDate +
        '|' +
        vnp_CreateDate +
        '|' +
        vnp_IpAddr +
        '|' +
        vnp_OrderInfo

    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex')

    const dataObj = {
        vnp_RequestId: vnp_RequestId,
        vnp_Version: vnp_Version,
        vnp_Command: vnp_Command,
        vnp_TmnCode: vnp_TmnCode,
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_TransactionDate: vnp_TransactionDate,
        vnp_CreateDate: vnp_CreateDate,
        vnp_IpAddr: vnp_IpAddr,
        vnp_SecureHash: vnp_SecureHash,
    }

    res.json({
        success: true,
        data: dataObj,
        message: 'Query data prepared. Send to VNPay API.',
    })
})

// @desc    Refund VNPay transaction
// @route   POST /api/payment/vnpay/refund
// @access  Private
const refundVNPayTransaction = asyncHandler(async (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    const date = new Date()

    const { orderId, transDate, amount, transType } = req.body

    const vnp_RequestId = moment(date).format('HHmmss')
    const vnp_Version = '2.1.0'
    const vnp_Command = 'refund'
    const vnp_TmnCode = vnpayConfig.vnp_TmnCode
    const vnp_TxnRef = orderId
    const vnp_TransactionDate = transDate
    const vnp_Amount = amount * 100
    const vnp_TransactionType = transType
    const vnp_CreateBy = req.user.email

    const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef

    const vnp_IpAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

    const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss')
    const vnp_TransactionNo = '0'

    const data =
        vnp_RequestId +
        '|' +
        vnp_Version +
        '|' +
        vnp_Command +
        '|' +
        vnp_TmnCode +
        '|' +
        vnp_TransactionType +
        '|' +
        vnp_TxnRef +
        '|' +
        vnp_Amount +
        '|' +
        vnp_TransactionNo +
        '|' +
        vnp_TransactionDate +
        '|' +
        vnp_CreateBy +
        '|' +
        vnp_CreateDate +
        '|' +
        vnp_IpAddr +
        '|' +
        vnp_OrderInfo

    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex')

    const dataObj = {
        vnp_RequestId: vnp_RequestId,
        vnp_Version: vnp_Version,
        vnp_Command: vnp_Command,
        vnp_TmnCode: vnp_TmnCode,
        vnp_TransactionType: vnp_TransactionType,
        vnp_TxnRef: vnp_TxnRef,
        vnp_Amount: vnp_Amount,
        vnp_TransactionNo: vnp_TransactionNo,
        vnp_CreateBy: vnp_CreateBy,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_TransactionDate: vnp_TransactionDate,
        vnp_CreateDate: vnp_CreateDate,
        vnp_IpAddr: vnp_IpAddr,
        vnp_SecureHash: vnp_SecureHash,
    }

    res.json({
        success: true,
        data: dataObj,
        message: 'Refund data prepared. Send to VNPay API.',
    })
})

// @desc    Create Momo payment
// @route   POST /api/payment/momo/create
// @access  Private
const createMomoPayment = asyncHandler(async (req, res) => {
    // Momo payment integration
    // This is a placeholder - requires Momo merchant account

    res.json({
        success: false,
        message: 'Momo payment not implemented yet',
    })
})

// @desc    Momo callback
// @route   POST /api/payment/momo/callback
// @access  Public
const momoCallback = asyncHandler(async (req, res) => {
    res.json({
        success: false,
        message: 'Momo callback not implemented yet',
    })
})

// @desc    Get payment info
// @route   GET /api/payment/:orderId
// @access  Private
const getPaymentInfo = asyncHandler(async (req, res) => {
    const Order = require('../Models/Order')

    const order = await Order.findById(req.params.orderId)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    if (
        order.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403)
        throw new Error('Not authorized')
    }

    res.json({
        success: true,
        data: {
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            paymentInfo: order.paymentInfo,
            totalAmount: order.totalAmount,
            paidAt: order.paidAt,
        },
    })
})

// Helper functions
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = {
    createVNPayPayment,
    vnpayReturn,
    vnpayIPN,
    queryVNPayTransaction,
    refundVNPayTransaction,
    createMomoPayment,
    momoCallback,
    getPaymentInfo,
}
