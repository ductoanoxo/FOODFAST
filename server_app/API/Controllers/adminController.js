const Order = require('../Models/Order');
const Drone = require('../Models/Drone');
const User = require('../Models/User');
const { getDistanceFromLatLonInKm } = require('../Utils/locationUtils'); // Import distance utility (case-sensitive path)

// @desc    Get all pending orders (waiting for drone assignment)
// @route   GET /api/admin/orders/pending
// @access  Private (Admin only)
exports.getPendingOrders = async(req, res) => {
    try {
        // Only get orders with status 'ready' - food is prepared and ready for pickup
        // Restaurant has confirmed the order and finished preparing the food
        const orders = await Order.find({
                status: 'ready', // Only ready orders - food is prepared
                drone: null, // No drone assigned yet
            })
            .populate('user', 'name phone email')
            .populate('restaurant', 'name address location phone')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });

        const ordersWithDistance = orders.map(order => {
            if (
                order &&
                order.restaurant &&
                order.restaurant.location &&
                order.restaurant.location.coordinates &&
                order.deliveryInfo &&
                order.deliveryInfo.location &&
                order.deliveryInfo.location.coordinates
            ) {
                const [restLon, restLat] = order.restaurant.location.coordinates;
                const [userLon, userLat] = order.deliveryInfo.location.coordinates;

                const distance = getDistanceFromLatLonInKm(restLat, restLon, userLat, userLon);
                return {
                    ...order.toObject(), // Convert Mongoose document to plain object
                    distanceKm: distance.toFixed(2),
                };
            }
            return order.toObject(); // Return as is if locations are missing
        });

        res.json({
            success: true,
            count: ordersWithDistance.length,
            data: ordersWithDistance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all available drones (idle or low utilization)
// @route   GET /api/admin/drones/available
// @access  Private (Admin only)
exports.getAvailableDrones = async(req, res) => {
    try {
        const drones = await Drone.find({
                status: { $in: ['idle', 'available', 'returning'] },
                batteryLevel: { $gte: 20 }, // At least 20% battery
            })
            .sort({ batteryLevel: -1 }); // Sort by battery level

        // Calculate distance from order pickup location if provided
        const { lat, lng } = req.query;

        if (lat && lng) {
            const pickupLocation = [parseFloat(lng), parseFloat(lat)];

            // Find drones near the pickup location
            const dronesWithDistance = drones.map(drone => {
                if (drone.currentLocation && drone.currentLocation.coordinates) {
                    const droneLocation = drone.currentLocation.coordinates;
                    const distance = calculateDistance(
                        pickupLocation,
                        droneLocation
                    );
                    return {
                        ...drone.toObject(),
                        distance: distance.toFixed(2), // km
                    };
                }
                return {
                    ...drone.toObject(),
                    distance: null,
                };
            });

            // Sort by distance
            dronesWithDistance.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });

            return res.json({
                success: true,
                count: dronesWithDistance.length,
                data: dronesWithDistance,
            });
        }

        res.json({
            success: true,
            count: drones.length,
            data: drones,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// test sssss
// @desc    Manually assign drone to order
// @route   POST /api/admin/assign-drone
// @access  Private (Admin only)
////test
exports.assignDrone = async(req, res) => {
    try {
        const { orderId, droneId } = req.body;

        if (!orderId || !droneId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and Drone ID are required',
            });
        }

        const order = await Order.findById(orderId);
        const drone = await Drone.findById(droneId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: 'Drone not found',
            });
        }

        // Check if drone is available
        if (drone.status !== 'idle' && drone.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: `Drone is not available (current status: ${drone.status})`,
            });
        }

        // Check battery level
        if (drone.batteryLevel < 20) {
            return res.status(400).json({
                success: false,
                message: 'Drone battery is too low for assignment',
            });
        }

        // ✅ Update order - ONLY assign drone, do NOT change status
        // Restaurant needs to confirm handover first → picked_up
        // Then admin starts delivery simulation → delivering
        order.drone = droneId;
        // Do NOT set order.status = 'delivering' here!
        // Do NOT set order.deliveringAt here!
        await order.save();

        // Update drone - mark as busy (reserved for this order)
        drone.status = 'busy';
        drone.currentOrder = orderId;
        await drone.save();

        // Socket notification to restaurant
        try {
            const socketService = req.app.get('socketService');
            if (socketService) {
                const populatedOrder = await Order.findById(orderId)
                    .populate('drone', 'name model status batteryLevel')
                    .populate('restaurant', '_id name');

                if (populatedOrder && populatedOrder.restaurant) {
                    const roomName = `restaurant-${populatedOrder.restaurant._id}`;
                    const eventData = {
                        orderId: populatedOrder._id,
                        orderNumber: populatedOrder.orderNumber,
                        drone: populatedOrder.drone,
                        message: `Drone ${populatedOrder.drone?.name || 'N/A'} đã được phân công`,
                    };

                    // Use emitToRoom if available, fallback to direct emit
                    if (typeof socketService.emitToRoom === 'function') {
                        socketService.emitToRoom(roomName, 'order:drone-assigned', eventData);
                    } else if (socketService.io) {
                        socketService.io.to(roomName).emit('order:drone-assigned', eventData);
                    }

                    console.log('✅ Socket notification sent to:', roomName);
                }
            }
        } catch (socketError) {
            console.error('⚠️ Socket notification failed (non-critical):', socketError.message);
            // Continue execution - socket error shouldn't block assignment
        }

        // Fetch updated data
        const updatedOrder = await Order.findById(orderId)
            .populate('drone', 'name serialNumber status batteryLevel');
        const updatedDrone = await Drone.findById(droneId)
            .populate('currentOrder', 'orderNumber deliveryInfo');

        res.json({
            success: true,
            message: 'Drone assigned successfully',
            data: {
                order: updatedOrder,
                drone: updatedDrone,
            },
        });
    } catch (error) {
        console.error('Error in assignDrone:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Reassign order to different drone (emergency)
// @route   POST /api/admin/reassign-order
// @access  Private (Admin only)
exports.reassignOrder = async(req, res) => {
    try {
        const { orderId, fromDrone, toDrone, reason } = req.body;

        if (!orderId || !toDrone) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and new Drone ID are required',
            });
        }

        const order = await Order.findById(orderId);
        const newDrone = await Drone.findById(toDrone);

        if (!order || !newDrone) {
            return res.status(404).json({
                success: false,
                message: 'Order or Drone not found',
            });
        }

        // Update old drone if exists
        if (fromDrone) {
            const oldDrone = await Drone.findById(fromDrone);
            if (oldDrone) {
                oldDrone.status = 'available';
                oldDrone.currentOrder = null;
                await oldDrone.save();
            }
        }

        // Update order
        order.drone = toDrone;
        await order.save();

        // Update new drone
        newDrone.status = 'busy';
        newDrone.currentOrder = orderId;
        await newDrone.save();

        // Socket notification
        const socketService = req.app.get('socketService');
        if (socketService) {
            socketService.handleReassignment(null, {
                orderId,
                fromDrone,
                toDrone,
                reason,
            });
        }

        // Fetch updated data without problematic populates
        const updatedOrder = await Order.findById(orderId).populate('drone', 'name serialNumber status batteryLevel');
        const updatedDrone = await Drone.findById(toDrone).populate('currentOrder', 'orderNumber deliveryInfo');

        res.json({
            success: true,
            message: 'Order reassigned successfully',
            data: {
                order: updatedOrder,
                newDrone: updatedDrone,
            },
        });
    } catch (error) {
        console.error('Error in reassignOrder:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get fleet statistics
// @route   GET /api/admin/fleet/stats
// @access  Private (Admin only)
exports.getFleetStats = async(req, res) => {
    try {
        const totalDrones = await Drone.countDocuments();
        const idleDrones = await Drone.countDocuments({ status: 'available' });
        const busyDrones = await Drone.countDocuments({ status: 'busy' });
        const offlineDrones = await Drone.countDocuments({ status: 'offline' });
        const maintenanceDrones = await Drone.countDocuments({ status: 'maintenance' });
        const chargingDrones = await Drone.countDocuments({ status: 'charging' });

        // Count orders ready for drone assignment (food is prepared)
        const pendingOrders = await Order.countDocuments({
            status: 'ready', // Only ready orders - food is prepared
            drone: null,
        });

        // Count orders currently being delivered
        const activeOrders = await Order.countDocuments({
            status: { $in: ['delivering'] },
            drone: { $ne: null },
        });

        const todayDeliveries = await Order.countDocuments({
            status: 'delivered',
            deliveredAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
        });

        // Calculate today's revenue
        const todayRevenue = await Order.aggregate([{
                $match: {
                    status: 'delivered',
                    deliveredAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                fleet: {
                    total: totalDrones,
                    idle: idleDrones,
                    busy: busyDrones,
                    offline: offlineDrones,
                    maintenance: maintenanceDrones,
                    charging: chargingDrones,
                },
                orders: {
                    pending: pendingOrders,
                    active: activeOrders,
                    todayDeliveries,
                },
                revenue: {
                    today: (todayRevenue[0] && todayRevenue[0].total) || 0,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all drones with real-time location
// @route   GET /api/admin/fleet/map
// @access  Private (Admin only)
exports.getFleetMap = async(req, res) => {
    try {
        const drones = await Drone.find()
            .populate('currentOrder', 'orderNumber deliveryInfo')
            .select('name serialNumber status batteryLevel currentLocation currentOrder');

        res.json({
            success: true,
            count: drones.length,
            data: drones,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get drone performance stats
// @route   GET /api/admin/drones/performance
// @access  Private (Admin only)
exports.getDronePerformance = async(req, res) => {
    try {
        const drones = await Drone.find()
            .select('name serialNumber flightHours totalDeliveries');

        // Get delivery stats for each drone
        const droneStats = await Promise.all(
            drones.map(async(drone) => {
                const deliveries = await Order.find({
                    drone: drone._id,
                    status: 'delivered',
                });

                const totalDeliveries = deliveries.length;
                const successRate = totalDeliveries > 0 ? 100 : 0; // Simplified

                // Calculate average delivery time
                let avgDeliveryTime = 0;
                if (totalDeliveries > 0) {
                    const totalTime = deliveries.reduce((sum, order) => {
                        if (order.deliveredAt && order.confirmedAt) {
                            const time = (order.deliveredAt - order.confirmedAt) / 60000; // minutes
                            return sum + time;
                        }
                        return sum;
                    }, 0);
                    avgDeliveryTime = (totalTime / totalDeliveries).toFixed(1);
                }

                // Calculate average rating
                const ordersWithRating = deliveries.filter(o => o.rating);
                const avgRating = ordersWithRating.length > 0 ?
                    (ordersWithRating.reduce((sum, o) => sum + o.rating, 0) / ordersWithRating.length).toFixed(1) :
                    0;

                // Determine rank
                let rank = 'bronze';
                if (successRate >= 95 && avgRating >= 4.5) rank = 'gold';
                else if (successRate >= 90 && avgRating >= 4.0) rank = 'silver';

                return {
                    droneId: drone._id,
                    name: drone.name,
                    serialNumber: drone.serialNumber,
                    stats: {
                        totalDeliveries,
                        successRate,
                        avgDeliveryTime: parseFloat(avgDeliveryTime),
                        customerRating: parseFloat(avgRating),
                        flightHours: drone.flightHours || 0,
                        rank,
                    },
                };
            })
        );

        // Sort by performance
        droneStats.sort((a, b) => {
            const scoreA = a.stats.successRate * 0.4 + a.stats.customerRating * 20;
            const scoreB = b.stats.successRate * 0.4 + b.stats.customerRating * 20;
            return scoreB - scoreA;
        });

        res.json({
            success: true,
            data: droneStats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}