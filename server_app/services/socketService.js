const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedDrones = new Map(); // droneId -> socketId
        this.connectedAdmins = new Set(); // Set of admin socketIds
        this.droneLocations = new Map(); // droneId -> { lat, lng, status, battery }
    }

    initialize(server) {
        this.io = socketIO(server, {
            cors: {
                origin: '*',    
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.io.use(this.authenticateSocket.bind(this));
        this.io.on('connection', this.handleConnection.bind(this));

        console.log('✅ Socket.IO initialized');
        return this.io;
    }

    // Authenticate socket connections
    authenticateSocket(socket, next) {
        try {
            const authHeader = socket.handshake.headers.authorization;
            const token = socket.handshake.auth.token || (authHeader && authHeader.split(' ')[1]);

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    }

    handleConnection(socket) {
        const { user } = socket;
        console.log(`✅ Client connected: ${socket.id} | User: ${user.name} | Role: ${user.role}`);

        // Role-based room joining
        if (user.role === 'admin') {
            this.handleAdminConnection(socket);
        } else if (user.role === 'drone_operator') {
            this.handleDroneConnection(socket);
        } else if (user.role === 'customer') {
            this.handleCustomerConnection(socket);
        } else if (user.role === 'restaurant') {
            this.handleRestaurantConnection(socket);
        }

        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    // ==================== ADMIN HANDLERS ==================== //
    handleAdminConnection(socket) {
        const { user } = socket;

        socket.join('admin-room');
        this.connectedAdmins.add(socket.id);

        console.log(`👨‍💼 Admin connected: ${user.name}`);

        // Send current fleet status
        this.sendFleetStatus(socket);

        // Admin subscribes to all drone updates
        socket.on('admin:subscribe-fleet', () => {
            console.log(`📡 Admin ${socket.id} subscribed to fleet updates`);
            this.sendFleetStatus(socket);
        });

        // Admin assigns order to drone (Manual Assignment)
        socket.on('admin:assign-drone', async(data) => {
            await this.handleManualAssignment(socket, data);
        });

        // Admin re-assigns order (Emergency Re-Assignment)
        socket.on('admin:reassign-order', async(data) => {
            await this.handleReassignment(socket, data);
        });

        // Admin requests drone details
        socket.on('admin:get-drone-details', (droneId) => {
            this.sendDroneDetails(socket, droneId);
        });

        // Admin broadcasts shift request
        socket.on('admin:shift-request', (data) => {
            this.io.to('drone-room').emit('shift:new-request', data);
        });
    }

    // ==================== DRONE HANDLERS ==================== //
    handleDroneConnection(socket) {
        const { user } = socket;

        socket.join('drone-room');

        // Get droneId from user's assigned drone
        const droneId = user.droneId || socket.handshake.query.droneId;

        if (droneId) {
            socket.droneId = droneId;
            this.connectedDrones.set(droneId, socket.id);
            socket.join(`drone-${droneId}`);

            console.log(`🚁 Drone operator connected: ${user.name} | Drone: ${droneId}`);

            // Notify admins that drone came online
            this.notifyAdmins('drone:online', {
                droneId,
                operatorName: user.name,
                timestamp: new Date(),
            });
        }

        // Drone sends location updates
        socket.on('drone:location-update', (data) => {
            this.handleLocationUpdate(socket, data);
        });

        // Drone sends status updates
        socket.on('drone:status-update', (data) => {
            this.handleStatusUpdate(socket, data);
        });

        // Drone sends battery updates
        socket.on('drone:battery-update', (data) => {
            this.handleBatteryUpdate(socket, data);
        });

        // Drone reports emergency
        socket.on('drone:emergency', (data) => {
            this.handleEmergency(socket, data);
        });

        // Drone accepts/rejects mission
        socket.on('drone:mission-response', (data) => {
            this.handleMissionResponse(socket, data);
        });

        // Drone completes mission
        socket.on('drone:mission-completed', (data) => {
            this.handleMissionCompleted(socket, data);
        });
    }

    // ==================== CUSTOMER HANDLERS ==================== //
    handleCustomerConnection(socket) {
        const { user } = socket;
        console.log(`👤 Customer connected: ${user.name}`);

        // Customer tracks their order
        socket.on('customer:track-order', (orderId) => {
            socket.join(`order-${orderId}`);
            console.log(`📦 Customer ${socket.id} tracking order ${orderId}`);
        });
        
        // Handle join-order event (multiple naming variants for compatibility)
        socket.on('join-order', (orderId) => {
            socket.join(`order-${orderId}`);
            console.log(`📦 Customer ${user.name} joined order room ${orderId}`);
        });
        
        socket.on('join-order-room', (data) => {
            const orderId = data.orderId || data;
            socket.join(`order-${orderId}`);
            console.log(`📦 User ${user.name} joined order room ${orderId}`);
        });
        
        socket.on('leave-order', (orderId) => {
            socket.leave(`order-${orderId}`);
            console.log(`📦 Customer ${user.name} left order room ${orderId}`);
        });
        
        socket.on('leave-order-room', (data) => {
            const orderId = data.orderId || data;
            socket.leave(`order-${orderId}`);
            console.log(`📦 User ${user.name} left order room ${orderId}`);
        });
        
        // Handle order status update requests from client (for setting waiting_for_customer status)
        socket.on('order:status-updated', async (data) => {
            try {
                const { orderId, status, timestamp } = data;
                console.log(`📡 [SERVER] Client requested status update:`, { orderId, status, timestamp });
                
                // Only allow specific status transitions from client
                if (status === 'waiting_for_customer') {
                    const Order = require('../API/Models/Order');
                    const order = await Order.findById(orderId);
                    
                    if (!order) {
                        console.error(`❌ Order ${orderId} not found`);
                        return;
                    }
                    
                    console.log(`📦 Order ${orderId} current status: ${order.status}`);
                    
                    if (order.status === 'delivering') {
                        order.status = 'waiting_for_customer';
                        order.arrivedAt = timestamp || new Date();
                        await order.save();
                        
                        console.log(`✅ Order ${orderId} status updated: delivering → waiting_for_customer`);
                        
                        // Broadcast the update to all connected clients with full details
                        const payload = {
                            orderId: order._id,
                            _id: order._id,
                            orderNumber: order.orderNumber,
                            status: order.status,
                            timestamp: order.arrivedAt,
                            arrivedAt: order.arrivedAt,
                            confirmedAt: order.confirmedAt,
                            preparingAt: order.preparingAt,
                            readyAt: order.readyAt,
                            deliveringAt: order.deliveringAt,
                            deliveredAt: order.deliveredAt,
                            cancelledAt: order.cancelledAt,
                            paymentStatus: order.paymentStatus,
                        };
                        
                        console.log(`📡 [SERVER] Broadcasting order:status-updated to:`, {
                            orderRoom: `order-${orderId}`,
                            restaurantRoom: `restaurant-${order.restaurant}`,
                            adminRoom: 'admin-room',
                            global: 'all clients',
                            payload: payload
                        });
                        
                        this.io.to(`order-${orderId}`).emit('order:status-updated', payload);
                        this.io.to(`restaurant-${order.restaurant}`).emit('order:status-updated', {...payload, restaurantId: order.restaurant });
                        this.io.emit('order:status-updated', payload);
                        this.io.to('admin-room').emit('order:status-updated', payload);
                        
                        console.log(`✅ [SERVER] Broadcast complete for order ${orderId}`);
                    } else {
                        console.log(`⚠️ Order ${orderId} status is ${order.status}, not 'delivering'. Skipping update.`);
                    }
                } else {
                    console.log(`⚠️ Status "${status}" is not allowed from client`);
                }
            } catch (error) {
                console.error('❌ Error updating order status from socket:', error);
            }
        });
    }

    // ==================== RESTAURANT HANDLERS ==================== //
    handleRestaurantConnection(socket) {
        const { user } = socket;
        const restaurantId = user.restaurantId || socket.handshake.query.restaurantId;

        if (restaurantId) {
            socket.join(`restaurant-${restaurantId}`);
            console.log(`🍽️ Restaurant connected: ${user.name} | Restaurant: ${restaurantId}`);
        }

        // Restaurant marks order ready for pickup
        socket.on('restaurant:order-ready', (data) => {
            this.handleOrderReady(socket, data);
        });
    }

    // ==================== DISCONNECT HANDLER ==================== //
    handleDisconnect(socket) {
        const { user } = socket;

        if (user.role === 'admin') {
            this.connectedAdmins.delete(socket.id);
        } else if (user.role === 'drone_operator' && socket.droneId) {
            const droneId = socket.droneId;
            this.connectedDrones.delete(droneId);
            this.droneLocations.delete(droneId);

            // Notify admins that drone went offline
            this.notifyAdmins('drone:offline', {
                droneId,
                timestamp: new Date(),
            });
        }

        console.log(`❌ Client disconnected: ${socket.id}`);
    }

    // ==================== BUSINESS LOGIC HANDLERS ==================== //

    async handleManualAssignment(socket, { orderId, droneId }) {
        try {
            console.log(`📋 Manual assignment: Order ${orderId} → Drone ${droneId}`);

            // Get order and drone details from database
            const Order = require('../API/Models/Order');
            const Drone = require('../API/Models/Drone');

            const order = await Order.findById(orderId).populate('restaurant').populate('items.product');
            const drone = await Drone.findById(droneId);

            if (!order || !drone) {
                socket.emit('assignment:error', { message: 'Order or Drone not found' });
                return;
            }

            // Update order with drone
            order.drone = droneId;
            order.status = 'delivering';
            order.deliveringAt = new Date();
            await order.save();

            // Update drone status
            drone.status = 'busy';
            drone.currentOrder = orderId;
            await drone.save();

            // Notify the assigned drone
            const droneSocketId = this.connectedDrones.get(droneId);
            if (droneSocketId) {
                this.io.to(droneSocketId).emit('drone:mission-assigned', {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    pickup: {
                        name: order.restaurant.name,
                        address: order.restaurant.address,
                        location: order.restaurant.location,
                        phone: order.restaurant.phone,
                    },
                    delivery: {
                        name: order.deliveryInfo.name,
                        address: order.deliveryInfo.address,
                        location: order.deliveryInfo.location,
                        phone: order.deliveryInfo.phone,
                    },
                    items: order.items,
                    totalAmount: order.totalAmount,
                    estimatedTime: 15, // Calculate based on distance
                });
            }

            // Notify admins of successful assignment
            this.notifyAdmins('assignment:success', {
                orderId,
                droneId,
                timestamp: new Date(),
            });

            // Notify customer
            this.io.to(`order-${orderId}`).emit('order:drone-assigned', {
                droneId,
                droneName: drone.name,
                estimatedTime: 15,
            });

            // Emit success to socket if it exists (when called via socket event)
            if (socket) {
                socket.emit('assignment:success', { orderId, droneId });
            }

        } catch (error) {
            console.error('❌ Assignment error:', error);
            if (socket) {
                socket.emit('assignment:error', { message: error.message });
            }
        }
    }

    async handleReassignment(socket, { orderId, fromDrone, toDrone, reason }) {
        try {
            console.log(`🔄 Reassignment: Order ${orderId} | ${fromDrone} → ${toDrone}`);

            const Order = require('../API/Models/Order');
            const Drone = require('../API/Models/Drone');

            const order = await Order.findById(orderId).populate('restaurant');
            const oldDrone = await Drone.findById(fromDrone);
            const newDrone = await Drone.findById(toDrone);

            if (!order || !newDrone) {
                socket.emit('reassignment:error', { message: 'Order or new Drone not found' });
                return;
            }

            // Update order
            order.drone = toDrone;
            await order.save();

            // Update old drone
            if (oldDrone) {
                oldDrone.status = 'available';
                oldDrone.currentOrder = null;
                await oldDrone.save();
            }

            // Update new drone
            newDrone.status = 'busy';
            newDrone.currentOrder = orderId;
            await newDrone.save();

            // Notify old drone
            const oldDroneSocketId = this.connectedDrones.get(fromDrone);
            if (oldDroneSocketId) {
                this.io.to(oldDroneSocketId).emit('drone:mission-cancelled', {
                    orderId,
                    reason: reason || 'Reassigned to another drone',
                });
            }

            // Notify new drone
            const newDroneSocketId = this.connectedDrones.get(toDrone);
            if (newDroneSocketId) {
                this.io.to(newDroneSocketId).emit('drone:mission-assigned', {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    pickup: {
                        name: order.restaurant.name,
                        address: order.restaurant.address,
                        location: order.restaurant.location,
                    },
                    delivery: {
                        name: order.deliveryInfo.name,
                        address: order.deliveryInfo.address,
                        location: order.deliveryInfo.location,
                    },
                    estimatedTime: 15,
                    isReassignment: true,
                });
            }

            // Notify admins
            this.notifyAdmins('reassignment:success', {
                orderId,
                fromDrone,
                toDrone,
                reason,
                timestamp: new Date(),
            });

            // Emit success to socket if it exists (when called via socket event)
            if (socket) {
                socket.emit('reassignment:success', { orderId, toDrone });
            }

        } catch (error) {
            console.error('❌ Reassignment error:', error);
            if (socket) {
                socket.emit('reassignment:error', { message: error.message });
            }
        }
    }

    handleLocationUpdate(socket, data) {
        const { droneId, location, batteryLevel, status } = data;

        // Store location in memory
        this.droneLocations.set(droneId, {
            ...location,
            batteryLevel,
            status,
            timestamp: new Date(),
        });

        // Broadcast to admins
        this.notifyAdmins('fleet:location-update', {
            droneId,
            location,
            batteryLevel,
            status,
        });

        // If drone is on a mission, notify customer
        if (data.orderId) {
            this.io.to(`order-${data.orderId}`).emit('order:location-update', {
                location,
                batteryLevel,
                status,
            });
        }
    }

    handleStatusUpdate(socket, data) {
        const { droneId, orderId, status, eta } = data;

        console.log(`📊 Status update: Drone ${droneId} | Status: ${status}`);

        // Notify admins
        this.notifyAdmins('drone:status-update', data);

        // Notify customer
        if (orderId) {
            const payload = {
                orderId,
                status,
                eta,
                timestamp: new Date(),
            };
            // Emit to specific order room
            this.io.to(`order-${orderId}`).emit('order:status-updated', payload);
            this.io.to(`order-${orderId}`).emit('order-status-updated', payload);
            
            // Also emit globally for dashboards
            this.io.emit('order:status-updated', payload);
        }
    }

    handleBatteryUpdate(socket, data) {
        const { droneId, batteryLevel, voltage, temperature } = data;

        // Low battery alert
        if (batteryLevel < 20) {
            this.notifyAdmins('alert:low-battery', {
                droneId,
                batteryLevel,
                severity: batteryLevel < 10 ? 'critical' : 'warning',
                timestamp: new Date(),
            });
        }
    }

    handleEmergency(socket, data) {
        const { droneId, orderId, issue, location, description } = data;

        console.log(`🚨 EMERGENCY: Drone ${droneId} | Issue: ${issue}`);

        // Critical alert to all admins
        this.notifyAdmins('drone:emergency', {
            droneId,
            orderId,
            issue,
            location,
            description,
            operatorName: socket.user.name,
            timestamp: new Date(),
            severity: 'critical',
        });

        // Store emergency in database
        this.storeEmergency(droneId, orderId, issue, description, location);
    }

    handleMissionResponse(socket, { orderId, accepted, reason }) {
        const { droneId } = socket;

        console.log(`✅ Mission response: Drone ${droneId} | Accepted: ${accepted}`);

        this.notifyAdmins('drone:mission-response', {
            droneId,
            orderId,
            accepted,
            reason,
            timestamp: new Date(),
        });

        if (!accepted) {
            // Need to reassign
            this.notifyAdmins('assignment:rejected', {
                droneId,
                orderId,
                reason,
            });
        }
    }

    handleMissionCompleted(socket, data) {
        const { droneId, orderId, completedAt } = data;

        console.log(`✅ Mission completed: Drone ${droneId} | Order ${orderId}`);

        // Update drone status
        this.updateDroneStatus(droneId, 'idle');

        // Notify admins
        this.notifyAdmins('drone:mission-completed', {
            droneId,
            orderId,
            completedAt: completedAt || new Date(),
        });

        // Notify customer
        this.io.to(`order-${orderId}`).emit('order:delivered', {
            completedAt: completedAt || new Date(),
        });
    }

    handleOrderReady(socket, { orderId }) {
        console.log(`📦 Order ready for pickup: ${orderId}`);

        // Notify admins to assign a drone
        this.notifyAdmins('order:ready-for-assignment', {
            orderId,
            timestamp: new Date(),
        });
    }

    // ==================== UTILITY METHODS ==================== //

    notifyAdmins(event, data) {
        this.io.to('admin-room').emit(event, data);
    }

    sendFleetStatus(socket) {
        const fleetData = Array.from(this.droneLocations.entries()).map(([droneId, data]) => ({
            droneId,
            ...data,
            isOnline: this.connectedDrones.has(droneId),
        }));

        socket.emit('fleet:status', fleetData);
    }

    sendDroneDetails(socket, droneId) {
        const droneData = this.droneLocations.get(droneId);
        const isOnline = this.connectedDrones.has(droneId);

        socket.emit('drone:details', {
            droneId,
            ...droneData,
            isOnline,
        });
    }

    async updateDroneStatus(droneId, status) {
        try {
            const Drone = require('../API/Models/Drone');
            await Drone.findByIdAndUpdate(droneId, { status });
        } catch (error) {
            console.error('Error updating drone status:', error);
        }
    }

    async storeEmergency(droneId, orderId, issue, description, location) {
        try {
            // TODO: Create Emergency model and store
            console.log('Emergency stored:', { droneId, orderId, issue });
        } catch (error) {
            console.error('Error storing emergency:', error);
        }
    }

    // Get socket.io instance
    getIO() {
        return this.io;
    }
}

module.exports = new SocketService();