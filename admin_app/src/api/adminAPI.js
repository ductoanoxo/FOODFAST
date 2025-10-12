import axios from 'axios';

const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: `${API_URL}/api/admin`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token'); // Changed from 'token' to 'admin_token'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


// Get pending orders
export const getPendingOrders = async() => {
    const response = await axiosInstance.get('/orders/pending');
    return response.data;
};

// Get available drones
export const getAvailableDrones = async(lat, lng) => {
    const params = {};
    if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
    }
    const response = await axiosInstance.get('/drones/available', { params });
    return response.data;
};

// Assign drone to order
export const assignDrone = async(orderId, droneId) => {
    const response = await axiosInstance.post('/assign-drone', {
        orderId,
        droneId,
    });
    return response.data;
};

// Reassign order
export const reassignOrder = async(orderId, fromDrone, toDrone, reason) => {
    const response = await axiosInstance.post('/reassign-order', {
        orderId,
        fromDrone,
        toDrone,
        reason,
    });
    return response.data;
};

// Get fleet stats
export const getFleetStats = async() => {
    const response = await axiosInstance.get('/fleet/stats');
    return response.data;
};

// Get fleet map
export const getFleetMap = async() => {
    const response = await axiosInstance.get('/fleet/map');
    return response.data;
};

// Get drone performance
export const getDronePerformance = async() => {
    const response = await axiosInstance.get('/drones/performance');
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