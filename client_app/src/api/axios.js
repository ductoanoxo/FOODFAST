import axios from 'axios'

// Prefer same-origin API served by nginx reverse-proxy ("/api").
// If you explicitly set VITE_API_URL at build time it will still be used.
const API_URL = import.meta.env.VITE_API_URL || '/api'

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('pendingOrderId')
            
            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error.response?.data || error.message)
    }
)

export default axiosInstance