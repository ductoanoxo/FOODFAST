import axios from 'axios'

const API = axios.create({
    // Prefer same-origin '/api' so nginx reverse-proxy will forward requests to server_app.
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('drone_token')
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
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('drone_token')
            localStorage.removeItem('drone_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default API
