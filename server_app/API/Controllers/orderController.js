const asyncHandler = require('../Middleware/asyncHandler')
const Order = require('../Models/Order')
const Product = require('../Models/Product')
const Restaurant = require('../Models/Restaurant')
const PromoUsage = require('../Models/PromoUsage')
const Voucher = require('../Models/Voucher')
const VoucherUsage = require('../Models/VoucherUsage')
const { geocodeWithFallback } = require('../../services/geocodingService')
const OrderAudit = require('../Models/OrderAudit')
const axios = require('axios')
const crypto = require('crypto')
const moment = require('moment')

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async(req, res) => {
    const {
        items,
        deliveryInfo,
        paymentMethod,
        note,
        voucherCode, // Mã voucher (optional)
        clientCalculatedTotal, // Tổng tiền từ client (để validation)
        clientDiscount, // Giảm giá từ client (để validation)
    } = req.body

    console.log('Create order request:', { items, deliveryInfo, paymentMethod, note, voucherCode, clientCalculatedTotal, clientDiscount })

    if (!items || items.length === 0) {
        res.status(400)
        throw new Error('No order items')
    }

    // Validate deliveryInfo
    if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
        res.status(400)
        throw new Error('Delivery information is required')
    }

    // Calculate subtotal and validate products.
    // Also group items by their restaurant so we can notify only the restaurants that have items in this order.
    let subtotal = 0
    let restaurantId = null // keep first restaurant for backward compatibility (voucher logic etc.)

    // map of restaurantId -> { items: [{ productId, name, price, quantity }], subtotal }
    const restaurantsMap = new Map()
        // items to save in the order (snapshot prices after discounts)
    const savedItems = []

    for (let item of items) {
        const product = await Product.findById(item.product).populate(['restaurant', 'category'])
        if (!product) {
            res.status(404)
            throw new Error(`Product not found: ${item.product}`)
        }

        const prodRest = product.restaurant && product.restaurant._id ? String(product.restaurant._id) : null
        if (!prodRest) {
            res.status(400)
            throw new Error('Sản phẩm không thuộc nhà hàng nào')
        }

        // Set restaurant from first product for compatibility
        if (!restaurantId) {
            restaurantId = prodRest
        }

        // If any product's restaurant is closed, prevent ordering for that product
        if (product.restaurant && product.restaurant.isOpen === false) {
            res.status(400)
            throw new Error('Nhà hàng hiện đang đóng cửa, không thể đặt hàng')
        }

        // Calculate price: Check for active promotion first (same logic as getProducts API)
        let finalPrice = product.price
        const originalPrice = product.price
        let appliedPromotion = null
        let appliedDiscount = {
            type: 'none',
            value: 0,
            amount: 0,
        }
        const now = new Date()

        if (product.category) {
            const Promotion = require('../Models/Promotion')
            const promotion = await Promotion.findOne({
                restaurant: product.restaurant._id,
                category: product.category._id,
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now },
            })

            if (promotion) {
                const discountAmount = (product.price * promotion.discountPercent) / 100
                finalPrice = product.price - discountAmount

                // Store promotion info
                appliedPromotion = {
                    id: promotion._id,
                    name: promotion.name,
                    discountPercent: promotion.discountPercent,
                    category: product.category.name || 'N/A',
                }

                appliedDiscount = {
                    type: 'promotion',
                    value: promotion.discountPercent,
                    amount: Math.round(discountAmount),
                }
            }
        }

        // If no promotion, check product discount
        if (finalPrice === product.price) {
            const discount = product.discount || 0
            if (discount > 0) {
                const discountAmount = product.price * (discount / 100)
                finalPrice = product.price - discountAmount

                appliedDiscount = {
                    type: 'product_discount',
                    value: discount,
                    amount: Math.round(discountAmount),
                }
            }
        }

        // Round to integer VND to avoid floating point pennies
        const roundedFinalPrice = Math.round(finalPrice)

        const itemSubtotal = roundedFinalPrice * item.quantity
        subtotal += itemSubtotal

        if (!restaurantsMap.has(prodRest)) {
            restaurantsMap.set(prodRest, { items: [], subtotal: 0 })
        }
        const group = restaurantsMap.get(prodRest)
        group.items.push({
            productId: product._id,
            name: product.name,
            price: roundedFinalPrice,
            quantity: item.quantity,
        })
        group.subtotal += itemSubtotal

        // Prepare saved item snapshot for the order with detailed discount info
        savedItems.push({
            product: product._id,
            quantity: item.quantity,
            price: roundedFinalPrice,
            originalPrice: originalPrice,
            appliedPromotion: appliedPromotion,
            appliedDiscount: appliedDiscount,
        })
    }

    if (!restaurantId) {
        res.status(400)
        throw new Error('Restaurant not found')
    }

    const deliveryFee = req.body.deliveryFee || 15000

    // Handle voucher discount
    let discountAmount = 0
    let appliedVoucher = null
    let voucherObj = null

    if (voucherCode) {
        try {
            // Find voucher
            voucherObj = await Voucher.findOne({
                code: voucherCode.toUpperCase(),
                restaurant: restaurantId,
            })

            if (!voucherObj) {
                res.status(404)
                throw new Error('Mã voucher không tồn tại')
            }

            if (!voucherObj.isValid()) {
                res.status(400)
                throw new Error('Voucher không hợp lệ hoặc đã hết hạn')
            }

            // Check if user already used this voucher
            const existingUsage = await VoucherUsage.findOne({
                voucher: voucherObj._id,
                user: req.user._id,
            })

            if (existingUsage) {
                res.status(400)
                throw new Error('Bạn đã sử dụng voucher này rồi')
            }

            // Check min order
            if (subtotal < voucherObj.minOrder) {
                res.status(400)
                throw new Error(`Đơn hàng tối thiểu ${voucherObj.minOrder.toLocaleString('vi-VN')}đ`)
            }

            // Calculate discount
            discountAmount = voucherObj.calculateDiscount(subtotal)

            appliedVoucher = {
                id: voucherObj._id,
                code: voucherObj.code,
                name: voucherObj.name,
                discountType: voucherObj.discountType,
                discountValue: voucherObj.discountValue,
                maxDiscount: voucherObj.maxDiscount,
                discountAmount: discountAmount,
            }
        } catch (error) {
            console.error('Voucher error:', error)
                // Nếu voucher error, throw để không tạo order
            throw error
        }
    }

    const totalAmount = subtotal - discountAmount + deliveryFee

    // Validate với client calculation (cho phép sai lệch nhỏ do làm tròn)
    if (clientCalculatedTotal && Math.abs(totalAmount - clientCalculatedTotal) > 1) {
        console.warn('Price mismatch!', {
                serverTotal: totalAmount,
                clientTotal: clientCalculatedTotal,
                serverDiscount: discountAmount,
                clientDiscount: clientDiscount,
                subtotal,
                deliveryFee
            })
            // Log warning nhưng vẫn sử dụng giá từ server để đảm bảo an toàn
    }

    // Build unique list of applied promotions from savedItems
    const appliedPromotionsList = []
    for (const it of savedItems) {
        if (it.appliedPromotion && it.appliedPromotion.id) {
            // avoid duplicates
            if (!appliedPromotionsList.find(p => String(p.id) === String(it.appliedPromotion.id))) {
                appliedPromotionsList.push({
                    id: it.appliedPromotion.id,
                    name: it.appliedPromotion.name,
                    discountPercent: it.appliedPromotion.discountPercent,
                    category: it.appliedPromotion.category,
                })
            }
        }
    }

    // 🗺️ GEOCODING: Chuyển địa chỉ giao hàng thành tọa độ
    let deliveryCoordinates = null
    if (deliveryInfo && deliveryInfo.address) {
        console.log('🔄 Starting geocoding for address:', deliveryInfo.address);
        deliveryCoordinates = await geocodeWithFallback(deliveryInfo.address);
        console.log('✅ Geocoding completed. Coordinates:', deliveryCoordinates);
    } else {
        console.warn('⚠️ No delivery address provided, using default coordinates');
        deliveryCoordinates = [105.8342, 21.0278]; // Hanoi default
    }


    // Prepare deliveryInfo with location coordinates
    const deliveryInfoWithLocation = {
        ...deliveryInfo,
        location: {
            type: 'Point',
            coordinates: deliveryCoordinates, // [longitude, latitude]
        },
    }

    const order = await Order.create({
        user: req.user._id,
        items: savedItems,
        restaurant: restaurantId,
        deliveryInfo: deliveryInfoWithLocation,
        note: note || '',
        subtotal,
        deliveryFee,
        discount: discountAmount,
        appliedPromo: appliedVoucher ? null : null, // Keep for backward compatibility but deprecated
        appliedPromotions: appliedPromotionsList,
        appliedVoucher: appliedVoucher, // Store voucher info in dedicated field
        totalAmount,
        paymentMethod: paymentMethod || 'COD',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // 30 minutes
    })

    // Debug logs: show voucher application details
    try {
        console.log('Order creation debug:', {
            voucherCodeProvided: voucherCode || null,
            computedDiscountAmount: discountAmount,
            appliedVoucherSnapshot: appliedVoucher,
            orderDiscountStored: order.discount,
            orderAppliedVoucher: order.appliedVoucher,
            itemsWithPromotions: savedItems.map(item => ({
                productId: item.product,
                originalPrice: item.originalPrice,
                finalPrice: item.price,
                appliedPromotion: item.appliedPromotion,
                appliedDiscount: item.appliedDiscount,
            })),
        })
    } catch (e) {
        console.error('Failed to log order debug info', e)
    }

    // Record voucher usage
    if (voucherObj && discountAmount > 0) {
        try {
            await VoucherUsage.create({
                voucher: voucherObj._id,
                user: req.user._id,
                order: order._id,
                discountAmount,
            })

            // Increment usage count
            await Voucher.findByIdAndUpdate(voucherObj._id, {
                $inc: { usageCount: 1 },
            })
        } catch (error) {
            console.error('Failed to record voucher usage:', error)
                // Rollback order if voucher recording fails
            await Order.findByIdAndDelete(order._id)
            res.status(500)
            throw new Error('Không thể áp dụng voucher')
        }
    }

    // Update product sold count (use savedItems which contain correct quantities)
    for (let item of savedItems) {
        try {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { soldCount: item.quantity },
            })
        } catch (e) {
            console.error('Failed to update soldCount for product', item.product, e)
        }
    }

    console.log('Order created successfully:', order._id)

    // Emit new-order to the restaurant rooms so only restaurants that have items in this order get notified
    try {
        const io = req.app.get('io')
            // Populate user info for notification
        const populatedOrder = await Order.findById(order._id).populate('user', 'name phone')

        // For each restaurant that has items, emit a tailored notification containing only that restaurant's items and subtotal
        for (const [restId, group] of restaurantsMap.entries()) {
            try {
                const roomName = `restaurant-${restId}`
                    // number of sockets in the room (Socket.IO v4)
                const room = io.sockets.adapter.rooms.get(roomName)
                const roomSize = room ? room.size : 0

                console.log('Emitting new-order attempt:', { roomName, roomSize, orderId: order._id, orderNumber: order.orderNumber, restaurantId: restId, itemsCount: group.items.length, subtotal: group.subtotal })

                if (roomSize > 0) {
                    io.to(roomName).emit('new-order', {
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        restaurantId: restId,
                        items: group.items,
                        // include per-item promotion details for restaurant UI to show
                        itemsWithPromotions: savedItems.filter(si => {
                            const prod = group.items.find(gi => String(gi.productId) === String(si.product))
                            return !!prod
                        }).map(si => ({
                            product: si.product,
                            quantity: si.quantity,
                            price: si.price,
                            appliedPromotion: si.appliedPromotion,
                            appliedDiscount: si.appliedDiscount,
                        })),
                        subtotal: group.subtotal,
                        totalAmount: order.totalAmount, // overall total kept for reference
                        appliedVoucher: order.appliedVoucher,
                        appliedPromotions: order.appliedPromotions,
                        user: populatedOrder.user,
                        timestamp: new Date(),
                    })
                } else {
                    console.log(`Skipping emit to ${roomName} (no connected sockets) for order ${order.orderNumber}`)
                }
            } catch (emitErr) {
                console.error('Failed to emit new-order to restaurant', restId, emitErr)
            }
        }
    } catch (e) {
        console.error('Failed to emit new-order:', e)
    }

    res.status(201).json({
        success: true,
        data: order,
    })
})

// @desc    Get user orders or restaurant orders
// @route   GET /api/orders or GET /api/orders/restaurant
// @access  Private
const getOrders = asyncHandler(async(req, res) => {
    let query = {}

    // If restaurant role, get orders for their restaurant
    if (req.user.role === 'restaurant') {
        if (!req.user.restaurantId) {
            res.status(400)
            throw new Error('Restaurant ID not found for this user')
        }
        query = { restaurant: req.user.restaurantId }
    } else if (req.user.role === 'admin') {
        // Admin can see all orders, optionally filtered by status
        if (req.query.status) {
            query.status = req.query.status
        }
    } else {
        // Regular user sees their own orders
        query = { user: req.user._id }
    }

    const orders = await Order.find(query)
        .populate('items.product', 'name image price')
        .populate('restaurant', 'name image address phone')
        .populate('user', 'name phone email')
        .populate('drone', 'name model')
        .sort('-createdAt')

    res.json({
        success: true,
        data: orders,
    })
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product', 'name image price')
        .populate('restaurant', 'name image address phone')
        .populate('user', 'name phone email')
        .populate('drone', 'name model currentLocation')

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    // Make sure user owns order or is admin/restaurant
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'user') {
        res.status(401)
        throw new Error('Not authorized')
    }

    res.json({
        success: true,
        data: order,
    })
})

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Restaurant/Admin)
const updateOrderStatus = asyncHandler(async(req, res) => {
    const { status, reason } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    // If restaurant user tries to change status, ensure they belong to the restaurant
    if (req.user.role === 'restaurant') {
        if (!req.user.restaurantId || order.restaurant.toString() !== req.user.restaurantId.toString()) {
            res.status(403)
            throw new Error('Not authorized to update this order')
        }
    }

    // Prevent cancelling completed orders
    if (status === 'cancelled' && ['delivered', 'cancelled'].includes(order.status)) {
        res.status(400)
        throw new Error('Cannot cancel this order')
    }

    // If restaurant is cancelling, require a reason
    if (status === 'cancelled' && req.user.role === 'restaurant' && (!reason || String(reason).trim().length === 0)) {
        res.status(400)
        throw new Error('Cancel reason is required when restaurant cancels an order')
    }

    order.status = status

    // Update timestamps
    const now = new Date()
    if (status === 'confirmed') order.confirmedAt = now
    if (status === 'preparing') order.preparingAt = now
    if (status === 'ready') order.readyAt = now
    if (status === 'picked_up') order.pickedUpAt = now
    if (status === 'delivering') order.deliveringAt = now
    if (status === 'delivered') {
        order.deliveredAt = now
        order.paymentStatus = 'paid'
    }

    // Special handling for cancellation initiated by restaurant/admin
    if (status === 'cancelled') {
        order.cancelledAt = now
        order.cancelReason = reason || req.body.cancelReason || order.cancelReason || 'Cancelled'

        // Side effects: rollback voucher usage and decrement product soldCount
        try {
            // Rollback voucher usage if any
            if (order.appliedVoucher && order.appliedVoucher.id) {
                try {
                    const usage = await VoucherUsage.findOne({ order: order._id })
                    if (usage) {
                        // Decrement voucher usageCount
                        try {
                            await Voucher.findByIdAndUpdate(usage.voucher, { $inc: { usageCount: -1 } })
                        } catch (e) {
                            console.error('Failed to decrement voucher usageCount', e)
                        }
                        await VoucherUsage.deleteOne({ _id: usage._id })
                    }
                } catch (e) {
                    console.error('Failed to rollback VoucherUsage for order', order._id, e)
                }
            }

            // Decrement soldCount for each product in the order
            if (order.items && order.items.length > 0) {
                for (const it of order.items) {
                    try {
                        await Product.findByIdAndUpdate(it.product, { $inc: { soldCount: -Math.abs(it.quantity) } })
                    } catch (e) {
                        console.error('Failed to decrement soldCount for product', it.product, e)
                    }
                }
            }
        } catch (e) {
            console.error('Error handling cancellation side-effects', e)
        }

        // Create an audit entry
        try {
            await OrderAudit.create({
                order: order._id,
                user: req.user._id,
                action: 'cancelled',
                reason: order.cancelReason,
                meta: { initiatedByRole: req.user.role }
            })
        } catch (e) {
            console.error('Failed to create OrderAudit entry', e)
        }

        // If order was already paid, attempt a best-effort VNPay refund (if configured).
        if (order.paymentStatus === 'paid') {
            try {
                // mark refund as requested
                order.paymentStatus = 'refund_pending'
                await order.save()

                await OrderAudit.create({
                    order: order._id,
                    user: req.user._id,
                    action: 'refund_requested',
                    reason: 'Auto refund requested after restaurant cancellation',
                    meta: { initiatedByRole: req.user.role, paymentInfo: order.paymentInfo }
                })

                // Try to call VNPay refund API if available
                const vnpApi = process.env.VNPAY_API || null
                const vnpTmn = process.env.VNPAY_TMN_CODE || null
                const vnpHash = process.env.VNPAY_HASH_SECRET || null

                if (order.paymentInfo && order.paymentInfo.method === 'vnpay' && vnpApi && vnpTmn && vnpHash) {
                    try {
                        const date = new Date()
                        const vnp_RequestId = moment(date).format('HHmmss')
                        const vnp_Version = '2.1.0'
                        const vnp_Command = 'refund'
                        const vnp_TxnRef = order.paymentInfo.transactionId
                        const vnp_TransactionDate = order.paidAt ? moment(order.paidAt).format('YYYYMMDDHHmmss') : moment().format('YYYYMMDDHHmmss')
                        const vnp_Amount = Math.round((order.totalAmount || 0) * 100)
                        const vnp_TransactionType = '02'
                        const vnp_CreateBy = req.user.email || String(req.user._id)
                        const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef
                        const vnp_IpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || ''
                        const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss')
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

                        // Basic success heuristic: VNPay returns a RspCode or success flag
                        if (resp && resp.data && (resp.data.RspCode === '00' || resp.data.success)) {
                            order.paymentStatus = 'refunded'
                            await order.save()
                            await OrderAudit.create({
                                order: order._id,
                                user: req.user._id,
                                action: 'refund_completed',
                                reason: 'Refund processed via VNPay API',
                                meta: { response: resp.data }
                            })
                        } else {
                            // Mark as failed and keep refund_pending for manual handling
                            order.paymentStatus = 'refund_failed'
                            await order.save()
                            await OrderAudit.create({
                                order: order._id,
                                user: req.user._id,
                                action: 'refund_failed',
                                reason: 'VNPay refund API returned failure or unexpected response',
                                meta: { response: resp?.data }
                            })
                        }
                    } catch (refundErr) {
                        console.error('VNPay refund attempt failed', refundErr)
                        order.paymentStatus = 'refund_failed'
                        await order.save()
                        try {
                            await OrderAudit.create({
                                order: order._id,
                                user: req.user._id,
                                action: 'refund_failed',
                                reason: 'VNPay refund attempt threw error',
                                meta: { error: String(refundErr) }
                            })
                        } catch (e) {
                            console.error('Failed to create refund failed audit', e)
                        }
                    }
                }
            } catch (e) {
                console.error('Error while attempting refund for cancelled order', e)
            }
        }
    }

    await order.save()

    // Emit socket event for real-time update
    const io = req.app.get('io')
        // ✅ Use consistent event naming: emit both colon and hyphen variants for compatibility
    const payload = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        timestamp: now,
    }

    // Emit with colon format
    io.to(`order-${order._id}`).emit('order:status-updated', payload)
    io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant })

    // Also emit hyphen variant for older clients that still listen to 'order-status-updated'
    io.to(`order-${order._id}`).emit('order-status-updated', payload)
    io.to(`restaurant-${order.restaurant}`).emit('order-status-updated', {...payload, restaurantId: order.restaurant })

    res.json({
        success: true,
        data: order,
    })
})

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
const trackOrder = asyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product', 'name image')
        .populate('restaurant', 'name address location') // ✅ Added location for map
        .populate('drone', 'name currentLocation batteryLevel')

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    res.json({
        success: true,
        data: order,
    })
})

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('Not authorized')
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
        res.status(400)
        throw new Error('Cannot cancel this order')
    }

    order.status = 'cancelled'
    order.cancelledAt = new Date()
    order.cancelReason = req.body.reason || 'Cancelled by user'

    await order.save()

    res.json({
        success: true,
        data: order,
    })
})

// @desc    Get order history
// @route   GET /api/orders/history
// @access  Private
const getOrderHistory = asyncHandler(async(req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name image')
        .populate('restaurant', 'name image')
        .sort('-createdAt')
        .limit(50)

    res.json({
        success: true,
        data: orders,
    })
})

// @desc    Confirm delivery (customer received order)
// @route   POST /api/orders/:id/confirm-delivery
// @access  Private (Customer only)
const confirmDelivery = asyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('drone', 'name serialNumber');

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Bạn không có quyền xác nhận đơn hàng này');
    }

    // Check if order is in delivering status
    if (order.status !== 'delivering') {
        res.status(400);
        throw new Error('Đơn hàng chưa ở trạng thái đang giao');
    }

    // Update order status to delivered
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Update drone status to available and clear current order
    if (order.drone) {
        const Drone = require('../Models/Drone');
        const drone = await Drone.findById(order.drone._id);

        if (drone) {
            drone.status = 'available';
            drone.currentOrder = null;
            drone.totalFlights = (drone.totalFlights || 0) + 1;
            await drone.save();

            // Emit socket event to notify drone is available
            const socketService = req.app.get('socketService');
            if (socketService) {
                socketService.io.emit('drone:available', {
                    droneId: drone._id,
                    droneName: drone.name,
                });

                // Notify admins
                socketService.notifyAdmins('order:delivered', {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    droneId: drone._id,
                    droneName: drone.name,
                    timestamp: new Date(),
                });

                // Notify restaurant about completed order
                if (order.restaurant) {
                    socketService.io.to(`restaurant-${order.restaurant}`).emit('restaurant:order:completed', {
                        restaurantId: order.restaurant,
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        totalAmount: order.totalAmount,
                        deliveredAt: order.deliveredAt,
                        timestamp: new Date(),
                    });
                }
            }
        }
    }

    // Populate order details for response
    await order.populate('restaurant', 'name address phone');
    await order.populate('items.product', 'name image price');

    res.json({
        success: true,
        message: 'Xác nhận giao hàng thành công',
        data: order,
    });
});

// @desc    Restaurant confirms handover to drone
// @route   POST /api/orders/:id/restaurant-confirm-handover
// @access  Private (Restaurant only)
const restaurantConfirmHandover = asyncHandler(async(req, res) => {
    const { droneId } = req.body;

    // Validate restaurant user
    if (req.user.role !== 'restaurant') {
        res.status(403);
        throw new Error('Chỉ nhà hàng mới có thể xác nhận giao hàng');
    }

    const order = await Order.findById(req.params.id)
        .populate('restaurant', 'name address phone')
        .populate('drone', 'name model')
        .populate('user', 'name phone');

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Check if order belongs to this restaurant
    if (order.restaurant._id.toString() !== req.user.restaurantId.toString()) {
        res.status(403);
        throw new Error('Không có quyền xác nhận đơn hàng này');
    }

    // Validate order status
    if (order.status !== 'ready') {
        res.status(400);
        throw new Error(`Đơn hàng phải ở trạng thái 'ready' mới có thể xác nhận giao cho drone. Trạng thái hiện tại: ${order.status}`);
    }

    // CRITICAL: Validate drone is actually assigned (not null/undefined)
    if (!order.drone || !order.drone._id) {
        res.status(400);
        throw new Error('❌ Chưa có drone được phân công cho đơn hàng này. Admin cần assign drone trước khi nhà hàng có thể xác nhận giao hàng.');
    }

    // Validate droneId matches (if provided in request)
    if (droneId && order.drone._id.toString() !== droneId) {
        res.status(400);
        throw new Error('Drone ID không khớp với drone được phân công');
    }

    // Idempotency check - if already delivering, just return success
    if (order.status === 'delivering' || order.deliveringAt) {
        return res.json({
            success: true,
            message: 'Đơn hàng đã được xác nhận giao trước đó',
            data: order,
        });
    }

    // Update order status to delivering (restaurant confirm = start delivery)
    order.status = 'delivering';
    order.deliveringAt = new Date();
    order.pickedUpBy = req.user._id; // Record who confirmed

    await order.save();

    // Emit socket events
    const socketService = req.app.get('socketService');
    if (socketService) {
        // ✅ Notify customer order tracking page (emit both colon and hyphen variants)
        const deliveryPayload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: 'delivering',
            deliveringAt: order.deliveringAt,
            drone: {
                id: order.drone._id,
                name: order.drone.name,
            },
            timestamp: new Date(),
        };

        socketService.io.to(`order-${order._id}`).emit('order:status-updated', deliveryPayload);
        socketService.io.to(`order-${order._id}`).emit('order-status-updated', deliveryPayload);

        // Also emit specific delivering event
        socketService.io.to(`order-${order._id}`).emit('order:delivering', deliveryPayload);

        // Notify drone app
        socketService.io.to(`drone-${order.drone._id}`).emit('order:picked-up-confirmed', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            restaurantName: order.restaurant.name,
            pickedUpAt: order.pickedUpAt,
            message: 'Nhà hàng đã xác nhận bạn đã lấy hàng. Có thể bắt đầu giao!',
            timestamp: new Date(),
        });

        // Notify admins
        socketService.notifyAdmins('order:picked-up', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            restaurantId: order.restaurant._id,
            restaurantName: order.restaurant.name,
            droneId: order.drone._id,
            droneName: order.drone.name,
            pickedUpBy: req.user._id,
            timestamp: new Date(),
        });
    }

    // Populate order details for response
    await order.populate('items.product', 'name image price');

    res.json({
        success: true,
        message: 'Xác nhận giao hàng cho drone thành công',
        data: order,
    });
});

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    trackOrder,
    cancelOrder,
    getOrderHistory,
    confirmDelivery,
    restaurantConfirmHandover,
}