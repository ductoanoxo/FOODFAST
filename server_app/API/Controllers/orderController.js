const asyncHandler = require('../Middleware/asyncHandler')
const Order = require('../Models/Order')
const Product = require('../Models/Product')
const Restaurant = require('../Models/Restaurant')
const PromoUsage = require('../Models/PromoUsage')
const Voucher = require('../Models/Voucher')
const VoucherUsage = require('../Models/VoucherUsage')
const { geocodeWithFallback } = require('../../services/geocodingService')
const { getDistanceWithFallback } = require('../../services/routingService')
const OrderAudit = require('../Models/OrderAudit')
const axios = require('axios')
const crypto = require('crypto')
const moment = require('moment')

// Helper function: Process refund logic
// Chỉ đánh dấu đơn hàng là refund_pending, không tự động hoàn tiền
// Admin sẽ phải vào trang Refunds và bấm nút xác nhận để hoàn tiền
const processRefund = async(order, cancelledBy, cancelReason) => {
    const now = new Date()
    let refundInfo = null

    if (order.paymentStatus === 'paid') {
        try {
            // Đánh dấu là đang chờ xử lý hoàn tiền
            order.paymentStatus = 'refund_pending'

            await OrderAudit.create({
                order: order._id,
                user: cancelledBy._id,
                action: 'refund_requested',
                reason: `${cancelledBy.role === 'user' ? 'Khách hàng' : cancelledBy.role === 'restaurant' ? 'Nhà hàng' : 'Admin'} hủy đơn đã thanh toán`,
                meta: {
                    initiatedByRole: cancelledBy.role,
                    cancelledByName: cancelledBy.name || cancelledBy.email,
                    paymentInfo: order.paymentInfo,
                    totalAmount: order.totalAmount
                }
            })

            // Lưu thông tin để admin xác nhận sau
            const userPhone = (order.user && order.user.phone) ? order.user.phone : 'đã đăng ký';

            refundInfo = {
                status: 'pending',
                method: (order.paymentInfo && order.paymentInfo.method) ?
                    order.paymentInfo.method : 'manual', // Lưu phương thức thanh toán ban đầu
                amount: order.totalAmount,
                requestedAt: now,
                message: `Yêu cầu hoàn tiền đang được xử lý. Admin sẽ xác nhận và hoàn tiền trong vòng 24h. Chúng tôi sẽ liên hệ với bạn qua số điện thoại ${userPhone}`
            };

            order.refundInfo = refundInfo
        } catch (e) {
            console.error('Error processing refund:', e)
            order.paymentStatus = 'refund_pending'
            refundInfo = {
                status: 'pending',
                method: 'manual',
                amount: order.totalAmount,
                requestedAt: now,
                message: 'Yêu cầu hoàn tiền đã được ghi nhận. Admin sẽ xử lý trong vòng 24h'
            }
            order.refundInfo = refundInfo
        }
    } else if (order.paymentMethod === 'COD') {
        refundInfo = {
            status: 'not_applicable',
            message: 'Đơn hàng COD - Không có giao dịch cần hoàn'
        }
        order.refundInfo = refundInfo
    }

    return refundInfo
}

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

    // --- Delivery Fee Calculation ---
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.location || !restaurant.location.coordinates) {
        res.status(400);
        throw new Error('Restaurant location is not available for fee calculation.');
    }
    const [restLon, restLat] = restaurant.location.coordinates;

    const userCoordinates = await geocodeWithFallback(deliveryInfo.address);
    if (!userCoordinates) {
        res.status(400);
        throw new Error('Could not determine your location from the address to calculate the delivery fee.');
    }
    const [userLon, userLat] = userCoordinates;

    // 🚀 Tính khoảng cách THỰC TẾ theo đường đi (routing), không phải đường thẳng
    const routingInfo = await getDistanceWithFallback(restLat, restLon, userLat, userLon);
    const distance = routingInfo.distance; // km theo đường đi thực tế
    const estimatedDuration = routingInfo.duration; // phút
    const routingMethod = routingInfo.method; // 'routing' | 'haversine_adjusted' | 'haversine_fallback'

    const deliveryFee = calculateDeliveryFee(distance);
    const distanceKm = parseFloat(distance.toFixed(2));

    // Explanation mô tả rõ cách tính
    let distanceExplanation = '';
    if (routingMethod === 'routing') {
        distanceExplanation = `Khoảng cách được tính theo ĐƯỜNG ĐI THỰC TẾ (sử dụng OSRM routing API) từ nhà hàng (Lat: ${restLat.toFixed(6)}, Lon: ${restLon.toFixed(6)}) đến địa chỉ giao hàng (Lat: ${userLat.toFixed(6)}, Lon: ${userLon.toFixed(6)}). Khoảng cách: ${distanceKm} km. Thời gian ước tính: ~${estimatedDuration} phút. Phí vận chuyển: 15,000₫ cho 2 km đầu; sau đó 5,000₫ cho mỗi km tiếp theo (làm tròn lên).`;
    } else if (routingMethod === 'haversine_adjusted') {
        distanceExplanation = `Khoảng cách được tính theo đường thẳng (Haversine) và điều chỉnh thêm ~35% để phản ánh đường đi thực tế trong thành phố. Tọa độ: Nhà hàng (Lat: ${restLat.toFixed(6)}, Lon: ${restLon.toFixed(6)}) - Giao hàng (Lat: ${userLat.toFixed(6)}, Lon: ${userLon.toFixed(6)}). Khoảng cách ước tính: ${distanceKm} km. Thời gian ước tính: ~${estimatedDuration} phút. Phí vận chuyển: 15,000₫ cho 2 km đầu; sau đó 5,000₫ cho mỗi km tiếp theo.`;
    } else {
        distanceExplanation = `Khoảng cách được ước tính dựa trên đường thẳng với hệ số điều chỉnh. Khoảng cách: ${distanceKm} km. Phí vận chuyển: 15,000₫ cho 2 km đầu; sau đó 5,000₫/km.`;
    }
    // --- End Delivery Fee Calculation ---

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

    // Prepare deliveryInfo with location coordinates
    const deliveryInfoWithLocation = {
        ...deliveryInfo,
        location: {
            type: 'Point',
            coordinates: userCoordinates, // Use coordinates calculated earlier
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
        distanceKm,
        distanceExplanation,
        routingMethod,
        estimatedDuration,
        routeGeometry: (routingInfo && routingInfo.route && routingInfo.route.geometry) ?
            routingInfo.route.geometry : null, // Lưu route geometry từ OSRM
        discount: discountAmount,
        appliedPromo: appliedVoucher ? null : null, // Keep for backward compatibility but deprecated
        appliedPromotions: appliedPromotionsList,
        appliedVoucher: appliedVoucher, // Store voucher info in dedicated field
        totalAmount,
        paymentMethod: paymentMethod || 'COD',
        estimatedDeliveryTime: new Date(Date.now() + ((estimatedDuration || 30) * 60000)), // Dùng estimated duration từ routing
    });


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

    // Emit order:created event for real-time updates to all connected clients
    try {
        const createdPayload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            timestamp: new Date(),
        }
        
        console.log('📡 [SERVER] Emitting order:created globally:', createdPayload)
        io.emit('order:created', createdPayload)
        io.to('admin-room').emit('order:created', createdPayload)
        console.log('✅ Emitted order:created event globally and to admin-room')
    } catch (e) {
        console.error('Failed to emit order:created:', e)
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
        .select('-routeGeometry -__v') // Exclude heavy fields
        .sort('-createdAt')
        .limit(200) // Limit to prevent timeout
        .lean() // Convert to plain objects for better performance

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
        .populate('drone', 'name model currentLocation homeLocation batteryLevel status')

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
    let refundInfo = null // Initialize refund info variable

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

        // 💰 REFUND LOGIC - Use helper function
        // Populate order.user if needed
        if (!order.user || !order.user.name) {
            await order.populate('user', 'name email phone')
        }

        refundInfo = await processRefund(order, req.user, order.cancelReason)
    }

    await order.save()

    // Emit socket event for real-time update
    const io = req.app.get('io')
        // ✅ Use consistent event naming: emit both colon and hyphen variants for compatibility
    const payload = {
        orderId: order._id,
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        timestamp: now,
        confirmedAt: order.confirmedAt,
        preparingAt: order.preparingAt,
        readyAt: order.readyAt,
        deliveringAt: order.deliveringAt,
        arrivedAt: order.arrivedAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        timeoutAt: order.timeoutAt,
        returnedAt: order.returnedAt,
        cancelReason: order.cancelReason,
        paymentStatus: order.paymentStatus,
        ...(refundInfo && { refundInfo }), // Include refund info if cancellation happened
    }

    // Emit to specific rooms
    io.to(`order-${order._id}`).emit('order:status-updated', payload)
    io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant })

    // If order was cancelled, emit cancellation event
    if (status === 'cancelled') {
        io.to(`order-${order._id}`).emit('order:cancelled', payload)
        io.to(`restaurant-${order.restaurant}`).emit('order:cancelled', {...payload, restaurantId: order.restaurant })
    }

    // Also emit hyphen variant for older clients
    io.to(`order-${order._id}`).emit('order-status-updated', payload)
    io.to(`restaurant-${order.restaurant}`).emit('order-status-updated', {...payload, restaurantId: order.restaurant })
    
    // Emit globally for all connected clients (admin dashboards, user order history)
    console.log(`📡 [SERVER] Emitting order:status-updated globally:`, payload)
    io.emit('order:status-updated', payload)
    
    // Also emit to admin-room specifically
    io.to('admin-room').emit('order:status-updated', payload)
    
    if (status === 'cancelled') {
        io.emit('order:cancelled', payload)
        io.to('admin-room').emit('order:cancelled', payload)
    }

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
        .populate('drone', 'name currentLocation homeLocation batteryLevel status model serialNumber')

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
        .populate('restaurant', 'name')
        .populate('user', 'name email phone')

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('Not authorized')
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
        res.status(400)
        throw new Error('Cannot cancel this order')
    }

    // Check if order is too far in process to cancel
    if (['delivering', 'picked_up'].includes(order.status)) {
        res.status(400)
        throw new Error('Không thể hủy đơn hàng đang giao. Vui lòng liên hệ hotline hỗ trợ.')
    }

    const now = new Date()
    order.status = 'cancelled'
    order.cancelledAt = now
    order.cancelReason = req.body.reason || 'Khách hàng hủy đơn'

    // Rollback voucher usage and product soldCount
    try {
        // Rollback voucher
        if (order.appliedVoucher && order.appliedVoucher.id) {
            const usage = await VoucherUsage.findOne({ order: order._id })
            if (usage) {
                await Voucher.findByIdAndUpdate(usage.voucher, { $inc: { usageCount: -1 } })
                await VoucherUsage.deleteOne({ _id: usage._id })
            }
        }

        // Rollback soldCount
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { soldCount: -Math.abs(item.quantity) }
                })
            }
        }
    } catch (e) {
        console.error('Error rolling back order data:', e)
    }

    // Create audit log
    try {
        await OrderAudit.create({
            order: order._id,
            user: req.user._id,
            action: 'cancelled',
            reason: order.cancelReason,
            meta: { initiatedByRole: 'user' }
        })
    } catch (e) {
        console.error('Failed to create OrderAudit entry', e)
    }

    // 💰 REFUND LOGIC - Use helper function
    const refundInfo = await processRefund(order, req.user, order.cancelReason)

    await order.save()

    // Emit socket event
    try {
        const io = req.app.get('io')
        const cancelPayload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: 'cancelled',
            cancelledAt: now,
            refundInfo: refundInfo,
            timestamp: now,
        }

        // Emit to specific order room
        io.to(`order-${order._id}`).emit('order:status-updated', cancelPayload)
        io.to(`order-${order._id}`).emit('order:cancelled', cancelPayload)
        
        // Emit globally for admin and user dashboards
        console.log(`📡 [SERVER] Emitting order cancelled globally:`, cancelPayload)
        io.emit('order:status-updated', cancelPayload)
        io.emit('order:cancelled', cancelPayload)
        
        // Also emit to admin-room specifically
        io.to('admin-room').emit('order:status-updated', cancelPayload)
        io.to('admin-room').emit('order:cancelled', cancelPayload)

        if (order.restaurant && order.restaurant._id) {
            io.to(`restaurant-${order.restaurant._id}`).emit('order:cancelled', {
                ...cancelPayload,
                restaurantId: order.restaurant._id,
                cancelledBy: 'customer',
                customerName: order.user.name
            })
        }
        
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
                console.log(`🚁 Emitted drone:returning-home for cancelled order ${order._id}`)
                
                // Update drone status
                drone.status = 'returning'
                drone.currentOrder = null
                await drone.save()
            }
        }
    } catch (e) {
        console.error('Failed to emit cancel event:', e)
    }

    res.json({
        success: true,
        data: order,
        refundInfo: refundInfo,
        message: refundInfo && refundInfo.message ? refundInfo.message : 'Đơn hàng đã được hủy thành công'
    })
})

// @desc    Get order history
// @route   GET /api/orders/history
// @access  Private
const getOrderHistory = asyncHandler(async(req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name image')
        .populate('restaurant', 'name image')
        .select('-routeGeometry -__v') // Exclude heavy fields
        .sort('-createdAt')
        .limit(50)
        .lean() // Convert to plain JavaScript objects for better performance

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

    // Check if order is in delivering or waiting_for_customer status
    if (order.status !== 'delivering' && order.status !== 'waiting_for_customer') {
        res.status(400);
        throw new Error('Đơn hàng chưa ở trạng thái đang giao');
    }

    // 🚀 EMIT drone:returning-home BEFORE updating order status (like delivery_failed)
    // Add delay to ensure client has time to setup socket listeners
    if (order.drone) {
        const Drone = require('../Models/Drone');
        const drone = await Drone.findById(order.drone._id);
        
        if (drone && drone.homeLocation) {
            console.log(`🔙 Emitting drone:returning-home for delivered order ${order._id}`);
            const socketService = req.app.get('socketService');
            if (socketService && socketService.io) {
                // ✅ Use customer location from order.deliveryInfo.location, NOT drone.currentLocation
                const customerLocation = order.deliveryInfo?.location?.coordinates 
                    ? {
                        type: 'Point',
                        coordinates: order.deliveryInfo.location.coordinates
                    }
                    : drone.currentLocation; // Fallback to drone location if no delivery info
                
                const payload = {
                    orderId: order._id,
                    droneId: drone._id,
                    droneName: drone.name,
                    currentLocation: customerLocation, // ✅ FIXED: Use customer location from deliveryInfo
                    homeLocation: drone.homeLocation,
                    estimatedDuration: 5,
                    timestamp: new Date()
                };
                
                console.log(`📍 [confirmDelivery] Drone returning from CUSTOMER location:`, customerLocation.coordinates);
                
                // Delay emission to ensure client listeners are ready
                setTimeout(() => {
                    // Emit to order room only (not broadcast to prevent duplicate events)
                    socketService.io.to(`order-${order._id}`).emit('drone:returning-home', payload);
                    console.log(`📡 [orderController] Emitted drone:returning-home for delivered order (delayed)`, payload);
                }, 1000); // 1 second delay to allow client to setup listeners
            }
        }
    }

    // Update order status to delivered
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Emit order status update globally
    const io = req.app.get('io');
    if (io) {
        const deliveryPayload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: 'delivered',
            deliveredAt: order.deliveredAt,
            timestamp: new Date(),
        };
        
        // Emit to order room
        io.to(`order-${order._id}`).emit('order:status-updated', deliveryPayload);
        io.to(`order-${order._id}`).emit('delivery:complete', deliveryPayload);
        
        // Emit globally
        io.emit('order:status-updated', deliveryPayload);
        io.emit('delivery:complete', deliveryPayload);
    }

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

    // 🎯 DEMO LOGIC: Sau 5 giây → waiting_for_customer, sau 40 giây → timeout
    setTimeout(async() => {
        try {
            // Sau 5 giây: Drone "đã đến" nơi giao hàng
            const updatedOrder = await Order.findById(order._id);
            if (!updatedOrder || updatedOrder.status !== 'delivering') {
                console.log(`⚠️ Order ${order._id} status changed, skipping timeout logic`);
                return;
            }

            updatedOrder.status = 'waiting_for_customer';
            updatedOrder.arrivedAt = new Date();
            await updatedOrder.save();

            console.log(`⏰ Order ${order._id} → waiting_for_customer (40s countdown started)`);

            // Emit socket event
            if (socketService && socketService.io) {
                socketService.io.emit('order:status-updated', {
                    orderId: updatedOrder._id,
                    status: 'waiting_for_customer',
                    arrivedAt: updatedOrder.arrivedAt,
                    message: 'Drone đã đến - Vui lòng nhận hàng trong 40 giây!'
                });
                socketService.io.to(`order-${updatedOrder._id}`).emit('order:status-updated', {
                    orderId: updatedOrder._id,
                    status: 'waiting_for_customer',
                    arrivedAt: updatedOrder.arrivedAt,
                    message: 'Drone đã đến - Vui lòng nhận hàng trong 40 giây!'
                });
            }

            // Set timeout 40 giây
            setTimeout(async() => {
                try {
                    const finalOrder = await Order.findById(order._id).populate('drone');
                    if (!finalOrder || finalOrder.status !== 'waiting_for_customer') {
                        console.log(`✅ Order ${order._id} đã được nhận hoặc đã xử lý`);
                        return;
                    }

                    // Timeout: Chuyển drone về available
                    console.log(`❌ Order ${order._id} TIMEOUT! Drone về trạng thái sẵn sàng`);

                    // 🚀 EMIT drone:returning-home TRƯỚC KHI save order status
                    if (finalOrder.drone && finalOrder.drone.homeLocation) {
                        console.log(`🔙 Emitting drone:returning-home for order ${finalOrder._id}`);
                        if (socketService && socketService.io) {
                            const payload = {
                                orderId: finalOrder._id,
                                droneId: finalOrder.drone._id,
                                droneName: finalOrder.drone.name,
                                currentLocation: finalOrder.drone.currentLocation,
                                homeLocation: finalOrder.drone.homeLocation,
                                estimatedDuration: 5,
                                timestamp: new Date()
                            };
                            
                            // Emit to order room only (not broadcast to prevent duplicate events)
                            socketService.io.to(`order-${finalOrder._id}`).emit('drone:returning-home', payload);
                            console.log(`📡 [orderController] Emitted drone:returning-home`, payload);
                        }
                    }

                    finalOrder.status = 'delivery_failed';
                    finalOrder.cancelReason = 'Không gặp người nhận sau 40 giây';
                    await finalOrder.save();

                    // Drone về available
                    if (finalOrder.drone) {
                        const Drone = require('../Models/Drone');
                        const droneToFree = await Drone.findById(finalOrder.drone._id);
                        if (droneToFree) {
                            droneToFree.status = 'available';
                            droneToFree.currentOrder = null;
                            await droneToFree.save();
                            console.log(`🚁 Drone ${droneToFree.name} → available`);
                        }
                    }

                    // Emit socket event WITH DRONE INFO
                    if (socketService && socketService.io) {
                        const eventPayload = {
                            orderId: finalOrder._id,
                            status: 'delivery_failed',
                            message: 'Giao hàng thất bại - Không gặp người nhận',
                            // Include drone homeLocation for client animation
                            drone: finalOrder.drone ? {
                                _id: finalOrder.drone._id,
                                name: finalOrder.drone.name,
                                currentLocation: finalOrder.drone.currentLocation,
                                homeLocation: finalOrder.drone.homeLocation
                            } : null
                        };
                        
                        socketService.io.emit('order:status-updated', eventPayload);
                        socketService.io.to(`order-${finalOrder._id}`).emit('order:status-updated', eventPayload);
                        console.log('📡 Emitted order:status-updated with drone info:', eventPayload);
                    }
                } catch (error) {
                    console.error('❌ Error in timeout handler:', error);
                }
            }, 40000); // 40 giây

        } catch (error) {
            console.error('❌ Error in arrival handler:', error);
        }
    }, 5000); // 5 giây

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

const { calculateDeliveryFee } = require('../Utils/locationUtils')

// @desc    Calculate delivery fee
// @route   POST /api/orders/calculate-fee
// @access  Private
const calculateFee = asyncHandler(async(req, res) => {
    const { restaurantId, userAddress } = req.body;

    if (!restaurantId || !userAddress) {
        res.status(400);
        throw new Error('Restaurant ID and user address are required');
    }

    // Get restaurant location
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.location || !restaurant.location.coordinates) {
        res.status(404);
        throw new Error('Restaurant not found or has no location');
    }
    const [restLon, restLat] = restaurant.location.coordinates;

    // Geocode user address
    const userCoordinates = await geocodeWithFallback(userAddress);
    if (!userCoordinates) {
        res.status(400);
        throw new Error('Could not determine location from the provided address');
    }
    const [userLon, userLat] = userCoordinates;

    // 🚀 Tính khoảng cách THỰC TẾ theo đường đi (routing)
    const routingInfo = await getDistanceWithFallback(restLat, restLon, userLat, userLon);
    const distance = routingInfo.distance;
    const estimatedDuration = routingInfo.duration;

    // Calculate fee
    const fee = calculateDeliveryFee(distance);

    res.json({
        success: true,
        deliveryFee: fee,
        distance: distance.toFixed(2), // km (routing distance)
        estimatedDuration: estimatedDuration, // phút
        routingMethod: routingInfo && routingInfo.method ? routingInfo.method : null,
        routeGeometry: routingInfo && routingInfo.route && routingInfo.route.geometry ?
            routingInfo.route.geometry : null, // GeoJSON geometry cho map
        restaurantLocation: restaurant.location,
        userLocation: { type: 'Point', coordinates: userCoordinates }
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
    calculateFee,
}