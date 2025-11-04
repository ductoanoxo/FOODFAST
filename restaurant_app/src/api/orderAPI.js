import axios from './axios';

// Get all orders for restaurant
export const getRestaurantOrders = async(status) => {
    const params = status ? { status } : {};
    const response = await axios.get('/orders/restaurant', { params });
    return response.data;
};

// Update order status
// Update order status - allow optional reason for cancellations
export const updateOrderStatus = async(orderId, status, reason) => {
    const body = { status };
    if (reason) body.reason = reason;
    const response = await axios.patch(`/orders/${orderId}/status`, body);
    return response.data;
};

// Get order details
export const getOrderDetails = async(orderId) => {
    const response = await axios.get(`/orders/${orderId}`);
    return response.data;
};

// Assign drone to order
export const assignDroneToOrder = async(orderId, droneId) => {
    const response = await axios.patch(`/orders/${orderId}/assign-drone`, { droneId });
    return response.data;
};

// Restaurant confirms handover to drone
export const restaurantConfirmHandover = async(orderId, droneId) => {
    const response = await axios.post(`/orders/${orderId}/restaurant-confirm-handover`, { droneId });
    return response.data;
};