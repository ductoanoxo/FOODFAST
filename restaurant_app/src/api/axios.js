import axios from 'axios';

// Resolve a sensible default API base URL so the same build can work locally
// and when deployed to the same host. Prefer VITE_API_URL when provided.
const resolvedBaseURL = import.meta.env.VITE_API_URL || (() => {
    const host = window.location.hostname;
    // Local development: assume backend runs on port 5000
    if (host === 'localhost' || host === '127.0.0.1') {
        return `${window.location.protocol}//${host}:5000/api`;
    }
    // Production / same-origin: use origin + /api
    return `${window.location.origin}/api`;
})();

const instance = axios.create({
    baseURL: resolvedBaseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('restaurant_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Auto-detect FormData and set appropriate Content-Type
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('restaurant_token');
            localStorage.removeItem('restaurant_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;