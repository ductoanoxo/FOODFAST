const asyncHandler = require('../Middleware/asyncHandler')
const Drone = require('../Models/Drone')

// @desc    Get all drones
// @route   GET /api/drones
// @access  Public
const getDrones = asyncHandler(async(req, res) => {
    const { status, available } = req.query

    let query = {}

    // Status filter
    if (status) {
        query.status = status
    }

    // Available filter
    if (available !== undefined) {
        query.status = 'available'
    }

    const drones = await Drone.find(query).sort('-createdAt')

    res.json({
        success: true,
        count: drones.length,
        data: drones,
    })
})

// @desc    Get drone by ID
// @route   GET /api/drones/:id
// @access  Public
const getDroneById = asyncHandler(async(req, res) => {
    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    res.json({
        success: true,
        data: drone,
    })
})

// @desc    Create drone
// @route   POST /api/drones
// @access  Private (Admin)
const createDrone = asyncHandler(async(req, res) => {
    // Set currentLocation to homeLocation if not provided
    if (req.body.homeLocation && !req.body.currentLocation) {
        req.body.currentLocation = {
            type: 'Point',
            coordinates: req.body.homeLocation.coordinates
        }
    }

    const drone = await Drone.create(req.body)

    // Emit socket event to notify admins about new drone
    const io = req.app.get('io')
    if (io) {
        io.to('admin-room').emit('drone:created', {
            drone: drone,
            timestamp: new Date(),
        })
    }

    res.status(201).json({
        success: true,
        data: drone,
    })
})

// @desc    Update drone
// @route   PUT /api/drones/:id
// @access  Private (Admin/Drone)
const updateDrone = asyncHandler(async(req, res) => {
    let drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    drone = await Drone.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    // Emit socket event to notify admins about drone update
    const io = req.app.get('io')
    if (io) {
        io.to('admin-room').emit('drone:updated', {
            drone: drone,
            timestamp: new Date(),
        })
    }

    res.json({
        success: true,
        data: drone,
    })
})

// @desc    Delete drone
// @route   DELETE /api/drones/:id
// @access  Private (Admin)
const deleteDrone = asyncHandler(async(req, res) => {
    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    // Check if drone is currently assigned to an order
    if (drone.currentOrder) {
        res.status(400)
        throw new Error('Cannot delete drone that is currently assigned to an order')
    }

    const droneData = drone.toObject() // Save drone data before deletion

    await drone.deleteOne()

    // Emit socket event to notify admins about drone deletion
    const io = req.app.get('io')
    if (io) {
        io.to('admin-room').emit('drone:deleted', {
            droneId: droneData._id,
            droneName: droneData.name,
            timestamp: new Date(),
        })
    }

    res.json({
        success: true,
        data: {},
        message: `Drone ${droneData.name} has been deleted successfully`,
    })
})

// @desc    Update drone location
// @route   PATCH /api/drones/:id/location
// @access  Private (Drone/Admin)
const updateDroneLocation = asyncHandler(async(req, res) => {
    const { longitude, latitude } = req.body

    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    drone.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
    }

    await drone.save()

    // Emit socket event for real-time tracking
    const io = req.app.get('io')
    io.to(`drone-${drone._id}`).emit('drone-location-updated', {
        droneId: drone._id,
        location: drone.currentLocation,
        timestamp: new Date(),
    })

    res.json({
        success: true,
        data: drone,
    })
})

// @desc    Update drone status
// @route   PATCH /api/drones/:id/status
// @access  Private (Drone/Admin)
const updateDroneStatus = asyncHandler(async(req, res) => {
    const { status } = req.body

    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    drone.status = status
    await drone.save()

    res.json({
        success: true,
        data: drone,
    })
})

// @desc    Update drone battery
// @route   PATCH /api/drones/:id/battery
// @access  Private (Drone/Admin)
const updateDroneBattery = asyncHandler(async(req, res) => {
    const { batteryLevel } = req.body

    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    drone.batteryLevel = batteryLevel

    // Auto update status based on battery
    if (batteryLevel < 20) {
        drone.status = 'charging'
    }

    await drone.save()

    res.json({
        success: true,
        data: drone,
    })
})

// @desc    Assign drone to order
// @route   POST /api/drones/:id/assign
// @access  Private (Admin)
const assignDroneToOrder = asyncHandler(async(req, res) => {
    const { orderId } = req.body
    const Order = require('../Models/Order')

    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    if (drone.status !== 'available') {
        res.status(400)
        throw new Error('Drone is not available')
    }

    if (drone.batteryLevel < 30) {
        res.status(400)
        throw new Error('Drone battery too low')
    }

    const order = await Order.findById(orderId)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    // Update order - ONLY assign drone, do NOT change status
    // Restaurant needs to confirm handover first (picked_up)
    // Then admin starts delivery simulation (delivering)
    order.drone = drone._id
        // Do NOT set order.status = 'delivering' here!
        // Do NOT set order.deliveringAt here!
    await order.save()

    // Update drone - mark as reserved but not busy yet
    drone.status = 'busy' // Reserved for this order
    drone.currentOrder = order._id
    await drone.save()

    // Emit socket event to notify restaurant about drone assignment
    const socketService = req.app.get('socketService')
    if (socketService) {
        // Populate order with drone details for the event
        const populatedOrder = await Order.findById(order._id)
            .populate('drone', 'name model status batteryLevel')
            .populate('restaurant', 'name')

        // Notify restaurant about drone assignment
        socketService.io.to(`restaurant-${order.restaurant._id}`).emit('order:drone-assigned', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            drone: {
                _id: drone._id,
                name: drone.name,
                model: drone.model,
                status: drone.status,
                batteryLevel: drone.batteryLevel,
            },
        })

        // Also emit general order status update (use consistent event names)
        const statusPayload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            drone: populatedOrder.drone,
            timestamp: new Date(),
        }

        socketService.io.to(`order-${order._id}`).emit('order:status-updated', statusPayload)
        socketService.io.to(`order-${order._id}`).emit('order-status-updated', statusPayload)
    }

    res.json({
        success: true,
        data: {
            drone,
            order,
        },
    })
})

// @desc    Get nearby drones
// @route   GET /api/drones/nearby
// @access  Private (Admin)
const getNearbyDrones = asyncHandler(async(req, res) => {
    const { lng, lat, maxDistance = 5000 } = req.query

    if (!lng || !lat) {
        res.status(400)
        throw new Error('Please provide longitude and latitude')
    }

    const drones = await Drone.find({
        currentLocation: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                $maxDistance: parseInt(maxDistance),
            },
        },
        status: 'available',
        batteryLevel: { $gte: 30 },
    })

    res.json({
        success: true,
        count: drones.length,
        data: drones,
    })
})

// @desc    Get drone statistics
// @route   GET /api/drones/:id/stats
// @access  Private (Admin)
const getDroneStats = asyncHandler(async(req, res) => {
    const Order = require('../Models/Order')

    const drone = await Drone.findById(req.params.id)

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    // Total deliveries
    const totalDeliveries = await Order.countDocuments({
        drone: drone._id,
        status: 'delivered',
    })

    // Active delivery
    const activeDelivery = await Order.findOne({
        drone: drone._id,
        status: 'delivering',
    })

    // Total flight time (mock data - would come from telemetry)
    const totalFlightTime = drone.totalFlightHours || 0

    res.json({
        success: true,
        data: {
            totalDeliveries,
            activeDelivery,
            totalFlightTime,
            batteryLevel: drone.batteryLevel,
            status: drone.status,
            lastMaintenance: drone.lastMaintenance,
        },
    })
})

module.exports = {
    getDrones,
    getDroneById,
    createDrone,
    updateDrone,
    deleteDrone,
    updateDroneLocation,
    updateDroneStatus,
    updateDroneBattery,
    assignDroneToOrder,
    getNearbyDrones,
    getDroneStats,
}