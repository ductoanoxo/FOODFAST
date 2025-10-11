import axios from './axios';

// Get all orders
export const getAllOrders = async (filters) => {
  const response = await axios.get('/orders', { params: filters });
  return response.data;
};

// Get order details
export const getOrderById = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Get order statistics
export const getOrderStats = async () => {
  const response = await axios.get('/orders/stats');
  return response.data;
};
