// @ts-nocheck
import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(token) {
        if (this.socket && this.socket.connected) {
            return this.socket;
        }


        const SOCKET_URL =
            import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token,
            },
            transports: ['polling', 'websocket'], // Polling first for K8s NodePort compatibility
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Admin Socket connected:', this.socket.id);
            this.connected = true;
            
            // Log all incoming events for debugging
            this.socket.onAny((eventName, ...args) => {
                console.log(`📡 [SOCKET EVENT] ${eventName}:`, args[0]);
            });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Admin Socket disconnected:', reason);
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Admin Socket connection error:', error.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    getSocket() {
        return this.socket;
    }

    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }


    // Admin-specific methods
    subscribeToFleet() {
        if (this.socket) {
            this.socket.emit('admin:subscribe-fleet');
        }
    }

    assignDrone(orderId, droneId) {
        if (this.socket) {
            this.socket.emit('admin:assign-drone', { orderId, droneId });
        }
    }

    reassignOrder(orderId, fromDrone, toDrone, reason) {
        if (this.socket) {
            this.socket.emit('admin:reassign-order', {
                orderId,
                fromDrone,
                toDrone,
                reason,
            });
        }
    }

    getDroneDetails(droneId) {
        if (this.socket) {
            this.socket.emit('admin:get-drone-details', droneId);
        }
    }

    // Event listeners
    onFleetStatus(callback) {
        if (this.socket) {
            this.socket.on('fleet:status', callback);
        }
    }

    onFleetLocationUpdate(callback) {
        if (this.socket) {
            this.socket.on('fleet:location-update', callback);
        }
    }

    onDroneStatusUpdate(callback) {
        if (this.socket) {
            this.socket.on('drone:status-update', callback);
        }
    }

    onDroneOnline(callback) {
        if (this.socket) {
            this.socket.on('drone:online', callback);
        }
    }

    onDroneOffline(callback) {
        if (this.socket) {
            this.socket.on('drone:offline', callback);
        }
    }

    onDroneCreated(callback) {
        if (this.socket) {
            this.socket.on('drone:created', callback);
        }
    }

    onDroneUpdated(callback) {
        if (this.socket) {
            this.socket.on('drone:updated', callback);
        }
    }

    onDroneDeleted(callback) {
        if (this.socket) {
            this.socket.on('drone:deleted', callback);
        }
    }

    onDroneEmergency(callback) {
        if (this.socket) {
            this.socket.on('drone:emergency', callback);
        }
    }

    onLowBatteryAlert(callback) {
        if (this.socket) {
            this.socket.on('alert:low-battery', callback);
        }
    }

    onAssignmentSuccess(callback) {
        if (this.socket) {
            this.socket.on('assignment:success', callback);
        }
    }

    onReassignmentSuccess(callback) {
        if (this.socket) {
            this.socket.on('reassignment:success', callback);
        }
    }

    onOrderReady(callback) {
        if (this.socket) {
            this.socket.on('order:ready-for-assignment', callback);
        }
    }

    // Remove listeners
    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export default new SocketService();