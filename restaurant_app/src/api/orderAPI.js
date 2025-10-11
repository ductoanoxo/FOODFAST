import axios from './axios';

// Get all orders for restaurant
export const getRestaurantOrders = async (status) => {
  const params = status ? { status } : {};
  const response = await axios.get('/orders/restaurant', { params });
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}`);
  return response.data;
};

// Assign drone to order
export const assignDroneToOrder = async (orderId, droneId) => {
  const response = await axios.patch(`/orders/${orderId}/assign-drone`, { droneId });
  return response.data;
};
