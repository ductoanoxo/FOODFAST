import axios from './axios';

// Get pending orders
export const getPendingOrders = async() => {
    const response = await axios.get('/admin/orders/pending');
    return response.data;
};

// Get available drones
export const getAvailableDrones = async(lat, lng) => {
    const params = {};
    if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
    }
    const response = await axios.get('/admin/drones/available', { params });
    return response.data;
};

// Assign drone to order
export const assignDrone = async(orderId, droneId) => {
    const response = await axios.post('/admin/assign-drone', {
        orderId,
        droneId,
    });
    return response.data;
};

// Reassign order
export const reassignOrder = async(orderId, fromDrone, toDrone, reason) => {
    const response = await axios.post('/admin/reassign-order', {
        orderId,
        fromDrone,
        toDrone,
        reason,
    });
    return response.data;
};

// Get fleet stats
export const getFleetStats = async() => {
    const response = await axios.get('/admin/fleet/stats');
    return response.data;
};

// Get fleet map
export const getFleetMap = async() => {
    const response = await axios.get('/admin/fleet/map');
    return response.data;
};

// Get drone performance
export const getDronePerformance = async() => {
    const response = await axios.get('/admin/drones/performance');
    return response.data;
};

export default {
    getPendingOrders,
    getAvailableDrones,
    assignDrone,
    reassignOrder,
    getFleetStats,
    getFleetMap,
    getDronePerformance,
};