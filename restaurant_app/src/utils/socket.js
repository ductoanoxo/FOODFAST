// utils/socket.js
import { io } from 'socket.io-client';

let socket = null;

const RESOLVE_RESTAURANT_ID = () => {
    try {
        const u = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
        if (!u) return null;
        return String(
            u.restaurantId ||
            (u.restaurant && u.restaurant._id) ||
            u.restaurant ||
            (u.role === 'restaurant' ? u._id : '')
        ) || null;
    } catch {
        return null;
    }
};


const joinRestaurantRoom = () => {
    const rid = RESOLVE_RESTAURANT_ID();
    if (socket && socket.connected && rid) {
        socket.emit('join-restaurant', rid);
        console.log('[socket] joined restaurant room:', rid);
    } else {
        console.log('[socket] skip join: connected=', socket && socket.connected, 'rid=', rid);
    }
};


export const initSocket = () => {
    if (socket) return socket;

    socket = io('http://localhost:5000', {
        auth: { token: localStorage.getItem('restaurant_token') || '' },
        // Tùy chọn nên có để kết nối ổn định hơn:
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        timeout: 10000,
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('[socket] connected:', socket.id);
        joinRestaurantRoom(); // join ngay khi connect
    });

    // Khi backend khởi tạo lại / mạng chập chờn -> rejoin
    socket.on('reconnect', (attempt) => {
        console.log('[socket] reconnected, attempt:', attempt);
        joinRestaurantRoom();
    });

    socket.on('disconnect', (reason) => {
        console.log('[socket] disconnected:', reason);
    });

    socket.on('error', (err) => {
        console.error('[socket] error:', err);
    });

    return socket;
};

export const getSocket = () => socket || initSocket();
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Cho phép UI gọi join lại sau khi login đổi user
export const joinRestaurant = () => joinRestaurantRoom();

// ===== Order events helpers =====
export const onNewOrder = (cb) => getSocket().on('new-order', cb);

// Support both 'order:status-updated' (new) and 'order-status-updated' (legacy)
export const onOrderStatusUpdate = (cb) => {
    const s = getSocket();
    s.on('order:status-updated', cb);
    s.on('order-status-updated', cb);
};

export const onOrderCompleted = (cb) => getSocket().on('restaurant:order:completed', cb);
export const onDroneAssigned = (cb) => getSocket().on('order:drone-assigned', cb); // NEW

export const offNewOrder = (cb) => getSocket().off('new-order', cb);
export const offOrderStatusUpdate = (cb) => {
    const s = getSocket();
    s.off('order:status-updated', cb);
    s.off('order-status-updated', cb);
};
export const offOrderCompleted = (cb) => getSocket().off('restaurant:order:completed', cb);
export const offDroneAssigned = (cb) => getSocket().off('order:drone-assigned', cb); // NEW