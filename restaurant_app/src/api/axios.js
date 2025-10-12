import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
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
