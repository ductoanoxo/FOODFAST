import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('restaurant_token'),
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      // If restaurant user is available in localStorage, auto join restaurant room
      try {
        const user = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
        console.log('Restaurant user from localStorage:', user);
        if (user && user.restaurantId) {
          socket.emit('join-restaurant', user.restaurantId);
          console.log('Joining restaurant room:', user.restaurantId);
        } else {
          console.log('No restaurant user or restaurantId found');
        }
      } catch (e) {
        console.warn('Failed to parse restaurant_user for socket join', e);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Order events
export const onNewOrder = (callback) => {
  const socket = getSocket();
  socket.on('new-order', callback);
};

export const onOrderStatusUpdate = (callback) => {
  const socket = getSocket();
  socket.on('order-status-updated', callback);
};

export const offNewOrder = () => {
  const socket = getSocket();
  socket.off('new-order');
};

export const offOrderStatusUpdate = () => {
  const socket = getSocket();
  socket.off('order-status-updated');
};
