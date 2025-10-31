import axios from 'axios';

const instance = axios.create({

    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
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

instance.interceptors.response.use(
    (response) => {
        // Trả về response bình thường
        return response;
    },
    (error) => {
        // Nếu có response và status là 401
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
        }
        // Luôn reject để chỗ khác có thể xử lý tiếp
        return Promise.reject(error);
    }
);


export default instance;