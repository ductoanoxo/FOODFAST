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
                    socketService.io.emit('restaurant:order:completed', {
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

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    trackOrder,
    cancelOrder,
    getOrderHistory,
    confirmDelivery,
}