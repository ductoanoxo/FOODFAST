import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect(token) {
    if (this.connected && this.socket) {
      return this.socket
    }

    // Trong production sẽ dùng origin hiện tại (vì nginx đã proxy)
    // Trong dev local sẽ dùng http://localhost:5000
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
      typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:5000'
    )

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
      this.connected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.connected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  // Subscribe to order updates
  subscribeToOrder(orderId) {
    if (this.socket && orderId) {
      this.socket.emit('subscribe:order', orderId)
      console.log('📡 Subscribed to order:', orderId)
    }
  }

  unsubscribeFromOrder(orderId) {
    if (this.socket && orderId) {
      this.socket.emit('unsubscribe:order', orderId)
      console.log('📡 Unsubscribed from order:', orderId)
    }
  }

  // Listen for order status updates
  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('order:update', callback)
    }
  }

  // Listen for drone location updates
  onDroneLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('drone:location-update', callback)
    }
  }

  // Listen for fleet location updates
  onFleetLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('fleet:location-update', callback)
    }
  }

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Generic event emitter
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Remove event listener
  off(event) {
    if (this.socket) {
      this.socket.off(event)
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket
  }

  // Check if connected
  isConnected() {
    return this.connected && this.socket?.connected
  }
}

const socketService = new SocketService()
export default socketService
