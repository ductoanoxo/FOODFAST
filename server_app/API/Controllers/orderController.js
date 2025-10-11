const asyncHandler = require('../Middleware/asyncHandler')
const Order = require('../Models/Order')
const Product = require('../Models/Product')

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async(req, res) => {
    const {
        items,
        deliveryInfo,
        paymentMethod,
        note,
    } = req.body

    console.log('Create order request:', { items, deliveryInfo, paymentMethod, note })

    if (!items || items.length === 0) {
        res.status(400)
        throw new Error('No order items')
    }

    // Validate deliveryInfo
    if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
        res.status(400)
        throw new Error('Delivery information is required')
    }

    // Calculate subtotal and validate products
    let subtotal = 0
    let restaurantId = null

    for (let item of items) {
        const product = await Product.findById(item.product).populate('restaurant')
        if (!product) {
            res.status(404)
            throw new Error(`Product not found: ${item.product}`)
        }
        
        // Set restaurant from first product
        if (!restaurantId) {
            restaurantId = product.restaurant._id
        }
        
        subtotal += product.price * item.quantity
    }

    if (!restaurantId) {
        res.status(400)
        throw new Error('Restaurant not found')
    }

    const deliveryFee = req.body.deliveryFee || 15000
    const totalAmount = subtotal + deliveryFee

    const order = await Order.create({
        user: req.user._id,
        items,
        restaurant: restaurantId,
        deliveryInfo,
        note: note || '',
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: paymentMethod || 'COD',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // 30 minutes
    })

    // Update product sold count
    for (let item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { soldCount: item.quantity },
        })
    }

    console.log('Order created successfully:', order._id)

    res.status(201).json({
        success: true,
        data: order,
    })
})

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async(req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name image price')
        .populate('restaurant', 'name image')
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
    const { status } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    order.status = status

    // Update timestamps
    const now = new Date()
    if (status === 'confirmed') order.confirmedAt = now
    if (status === 'preparing') order.preparingAt = now
    if (status === 'ready') order.readyAt = now
    if (status === 'delivering') order.deliveringAt = now
    if (status === 'delivered') {
        order.deliveredAt = now
        order.paymentStatus = 'paid'
    }
    if (status === 'cancelled') order.cancelledAt = now

    await order.save()

    // Emit socket event for real-time update
    const io = req.app.get('io')
    io.to(`order-${order._id}`).emit('order-status-updated', {
        orderId: order._id,
        status: order.status,
        timestamp: now,
    })

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
        .populate('restaurant', 'name')
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

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    trackOrder,
    cancelOrder,
    getOrderHistory,
}