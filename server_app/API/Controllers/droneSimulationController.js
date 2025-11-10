const asyncHandler = require('../Middleware/asyncHandler');
const Drone = require('../Models/Drone');
const Order = require('../Models/Order');
const Restaurant = require('../Models/Restaurant');

/**
 * Drone Delivery Simulator
 * Simulates drone movement from restaurant to customer location with real-time updates
 */

// Store active simulations
const activeSimulations = new Map();

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Array} coord1 - [longitude, latitude]
 * @param {Array} coord2 - [longitude, latitude]
 * @returns {Number} Distance in kilometers
 */
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth radius in km
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees) {
    return (degrees * Math.PI) / 180;
}

/**
 * Interpolate position between two coordinates
 * @param {Array} start - [longitude, latitude]
 * @param {Array} end - [longitude, latitude]
 * @param {Number} progress - 0 to 1
 * @returns {Array} [longitude, latitude]
 */
function interpolatePosition(start, end, progress) {
    const [lon1, lat1] = start;
    const [lon2, lat2] = end;

    const lon = lon1 + (lon2 - lon1) * progress;
    const lat = lat1 + (lat2 - lat1) * progress;

    return [lon, lat];
}

/**
 * Start drone delivery simulation
 * @route POST /api/drones/:id/start-delivery
 * @access Private (Admin/Drone)
 */
const startDeliverySimulation = asyncHandler(async(req, res) => {
    const { orderId } = req.body;
    const droneId = req.params.id;

    // Validate drone
    const drone = await Drone.findById(droneId);
    if (!drone) {
        res.status(404);
        throw new Error('Drone not found');
    }

    // Validate order
    const order = await Order.findById(orderId).populate('restaurant', 'name address location');
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if order is in correct status (picked_up or ready)
    if (order.status !== 'picked_up' && order.status !== 'ready') {
        res.status(400);
        throw new Error(`Order must be in 'picked_up' or 'ready' status. Current: ${order.status}`);
    }

    // Check if delivery address has coordinates
    // Kiểm tra xem đơn hàng có tọa độ giao hàng không
    if (!order.deliveryInfo ||
        !order.deliveryInfo.location ||
        !order.deliveryInfo.location.coordinates
    ) {
        res.status(400);
        throw new Error('Order delivery address does not have coordinates');
    }

    // Kiểm tra xem nhà hàng có tọa độ không
    if (!order.restaurant ||
        !order.restaurant.location ||
        !order.restaurant.location.coordinates
    ) {
        res.status(400);
        throw new Error('Restaurant does not have coordinates');
    }

    // Stop existing simulation if any
    if (activeSimulations.has(droneId)) {
        clearInterval(activeSimulations.get(droneId).intervalId);
        activeSimulations.delete(droneId);
    }

    // Get coordinates
    const restaurantCoords = order.restaurant.location.coordinates; // [longitude, latitude]
    const customerCoords = order.deliveryInfo.location.coordinates; // [longitude, latitude]

    // Calculate total distance
    const totalDistance = calculateDistance(restaurantCoords, customerCoords);

    // Calculate estimated time (based on drone speed)
    // Assume average speed: 40 km/h = 40000 m/h = 11.11 m/s
    const droneSpeed = drone.speed || 40; // km/h
    const estimatedTimeMinutes = (totalDistance / droneSpeed) * 60; // minutes

    console.log(`🚁 Starting delivery simulation for Drone ${drone.name}`);
    console.log(`📍 From: ${restaurantCoords} → To: ${customerCoords}`);
    console.log(`📏 Distance: ${totalDistance.toFixed(2)} km`);
    console.log(`⏱️  Estimated time: ${estimatedTimeMinutes.toFixed(1)} minutes`);

    // Update drone status
    drone.status = 'busy';
    drone.currentOrder = orderId;
    drone.currentLocation = {
        type: 'Point',
        coordinates: restaurantCoords,
    };
    await drone.save();

    // Update order status to delivering
    order.status = 'delivering';
    order.deliveringAt = new Date();
    order.drone = droneId;
    await order.save();

    // Get socket.io instance
    const socketService = req.app.get('socketService');
    if (!socketService) {
        res.status(500);
        throw new Error('Socket service not available');
    }

    // Simulation parameters
    const updateInterval = 2000; // Update every 2 seconds
    const totalSteps = Math.ceil((estimatedTimeMinutes * 60 * 1000) / updateInterval); // Total number of updates
    let currentStep = 0;

    // Start simulation
    const intervalId = setInterval(async() => {
        try {
            currentStep++;
            const progress = currentStep / totalSteps; // 0 to 1

            if (progress >= 1) {
                // Delivery complete
                clearInterval(intervalId);
                activeSimulations.delete(droneId);

                // Update drone to final position
                drone.currentLocation = {
                    type: 'Point',
                    coordinates: customerCoords,
                };
                drone.status = 'available';
                drone.currentOrder = null;
                drone.totalFlights = (drone.totalFlights || 0) + 1;
                drone.totalDistance = (drone.totalDistance || 0) + totalDistance;
                await drone.save();

                // Update order status to delivered
                const deliveredOrder = await Order.findById(orderId);
                if (deliveredOrder && deliveredOrder.status === 'delivering') {
                    deliveredOrder.status = 'delivered';
                    deliveredOrder.deliveredAt = new Date();
                    deliveredOrder.paymentStatus = 'paid';
                    await deliveredOrder.save();

                    // Emit delivery complete event
                    socketService.io.to(`order-${orderId}`).emit('delivery:complete', {
                        orderId: orderId,
                        orderNumber: deliveredOrder.orderNumber,
                        droneId: droneId,
                        droneName: drone.name,
                        deliveredAt: deliveredOrder.deliveredAt,
                        timestamp: new Date(),
                    });

                    // Notify customer
                    socketService.io.emit('customer:order:delivered', {
                        orderId: orderId,
                        orderNumber: deliveredOrder.orderNumber,
                        message: 'Đơn hàng của bạn đã được giao thành công!',
                    });
                }

                console.log(`✅ Delivery complete for order ${orderId}`);
                return;
            }

            // Calculate current position
            const currentPosition = interpolatePosition(restaurantCoords, customerCoords, progress);

            // Update drone location in database
            drone.currentLocation = {
                type: 'Point',
                coordinates: currentPosition,
            };
            await drone.save();

            // Calculate remaining distance
            const remainingDistance = calculateDistance(currentPosition, customerCoords);

            // Emit real-time location update
            socketService.io.to(`order-${orderId}`).emit('drone:location:update', {
                orderId: orderId,
                droneId: droneId,
                location: {
                    type: 'Point',
                    coordinates: currentPosition,
                },
                progress: Math.round(progress * 100),
                remainingDistance: remainingDistance.toFixed(2),
                estimatedTimeRemaining: Math.ceil((1 - progress) * estimatedTimeMinutes),
                timestamp: new Date(),
            });

            // Also emit to drone-specific room
            socketService.io.to(`drone-${droneId}`).emit('drone:moving', {
                droneId: droneId,
                location: currentPosition,
                progress: Math.round(progress * 100),
            });

            console.log(
                `🚁 Drone ${drone.name} - Progress: ${Math.round(progress * 100)}% - ` +
                `Position: [${currentPosition[0].toFixed(6)}, ${currentPosition[1].toFixed(6)}]`
            );
        } catch (error) {
            console.error('Error in delivery simulation:', error);
            clearInterval(intervalId);
            activeSimulations.delete(droneId);
        }
    }, updateInterval);

    // Store simulation info
    activeSimulations.set(droneId, {
        intervalId,
        orderId,
        startTime: new Date(),
        totalSteps,
    });

    // Emit simulation started event
    socketService.io.to(`order-${orderId}`).emit('delivery:simulation:started', {
        orderId: orderId,
        droneId: droneId,
        droneName: drone.name,
        estimatedTimeMinutes: Math.ceil(estimatedTimeMinutes),
        totalDistance: totalDistance.toFixed(2),
        restaurantLocation: restaurantCoords,
        customerLocation: customerCoords,
        timestamp: new Date(),
    });

    res.json({
        success: true,
        message: 'Delivery simulation started',
        data: {
            droneId: droneId,
            orderId: orderId,
            estimatedTimeMinutes: Math.ceil(estimatedTimeMinutes),
            totalDistance: totalDistance.toFixed(2),
            updateInterval: updateInterval,
            totalSteps: totalSteps,
        },
    });
});

/**
 * Stop drone delivery simulation
 * @route POST /api/drones/:id/stop-delivery
 * @access Private (Admin)
 */
const stopDeliverySimulation = asyncHandler(async(req, res) => {
    const droneId = req.params.id;

    if (!activeSimulations.has(droneId)) {
        res.status(404);
        throw new Error('No active simulation found for this drone');
    }

    const simulation = activeSimulations.get(droneId);
    clearInterval(simulation.intervalId);
    activeSimulations.delete(droneId);

    // Update drone status
    const drone = await Drone.findById(droneId);
    if (drone) {
        drone.status = 'available';
        drone.currentOrder = null;
        await drone.save();
    }

    res.json({
        success: true,
        message: 'Delivery simulation stopped',
        data: {
            droneId: droneId,
            orderId: simulation.orderId,
        },
    });
});

/**
 * Get active simulations
 * @route GET /api/drones/simulations
 * @access Private (Admin)
 */
const getActiveSimulations = asyncHandler(async(req, res) => {
    const simulations = [];

    for (const [droneId, sim] of activeSimulations.entries()) {
        const drone = await Drone.findById(droneId).select('name model currentLocation');
        simulations.push({
            droneId: droneId,
            droneName: drone ? drone.name : null,
            orderId: sim.orderId,
            startTime: sim.startTime,
            currentProgress: Math.round(((sim.currentStep || 0) / sim.totalSteps) * 100),
        });
    }


    res.json({
        success: true,
        count: simulations.length,
        data: simulations,
    });
});

/**
 * @desc    Giả lập drone đã đến địa điểm giao hàng (cho timeout testing)
 * @route   POST /api/drone-sim/arrive/:orderId
 * @access  Public (for testing)
 */
const simulateDroneArrival = asyncHandler(async(req, res) => {
    const { orderId } = req.params;
    const {
        handleDroneArrived
    } = require('../services/droneDeliveryTimeoutService');

    const order = await Order.findById(orderId)
        .populate('drone')
        .populate('user', 'name phone');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.status !== 'delivering') {
        res.status(400);
        throw new Error(`Order must be in 'delivering' status. Current: ${order.status}`);
    }

    const result = await handleDroneArrived(
        orderId,
        order.drone._id,
        order.deliveryInfo.location
    );

    res.status(200).json({
        success: true,
        message: '🚁 Drone arrived! Waiting for customer...',
        data: result
    });
});

/**
 * @desc    Giả lập khách hàng nhận hàng
 * @route   POST /api/drone-sim/confirm/:orderId
 * @access  Public (for testing)
 */
const simulateCustomerConfirmation = asyncHandler(async(req, res) => {
    const { orderId } = req.params;
    const {
        confirmDeliveryReceived
    } = require('../services/droneDeliveryTimeoutService');

    const result = await confirmDeliveryReceived(orderId);

    res.status(200).json({
        success: true,
        message: '✅ Delivery confirmed!',
        data: result
    });
});

/**
 * @desc    Xem status delivery process
 * @route   GET /api/drone-sim/status/:orderId
 * @access  Public (for testing)
 */
const getDeliveryStatus = asyncHandler(async(req, res) => {
    const { orderId } = req.params;
    const {
        getWaitingStatus,
        WAITING_TIMEOUT
    } = require('../services/droneDeliveryTimeoutService');

    const order = await Order.findById(orderId)
        .populate('drone', 'name status')
        .populate('user', 'name phone');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const waitingStatus = getWaitingStatus(orderId);

    let timeRemaining = null;
    if (order.status === 'waiting_for_customer' && order.waitingStartedAt) {
        const elapsed = Date.now() - new Date(order.waitingStartedAt).getTime();
        timeRemaining = Math.max(0, Math.round((WAITING_TIMEOUT - elapsed) / 1000));
    }

    res.status(200).json({
        success: true,
        data: {
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                arrivedAt: order.arrivedAt,
                waitingStartedAt: order.waitingStartedAt,
                deliveredAt: order.deliveredAt,
                deliveryFailedAt: order.deliveryFailedAt
            },
            waiting: {
                isActive: waitingStatus.isWaiting,
                timeRemaining: timeRemaining ? `${timeRemaining}s` : null
            }
        }
    });
});

module.exports = {
    startDeliverySimulation,
    stopDeliverySimulation,
    getActiveSimulations,
    simulateDroneArrival,
    simulateCustomerConfirmation,
    getDeliveryStatus
};