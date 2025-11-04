import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with auth
const createAuthRequest = () => {
    const token = localStorage.getItem('admin_token')
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
        },
    })
}

// Get refund statistics
export const getRefundStats = async () => {
    const api = createAuthRequest()
    const response = await api.get('/refunds/stats')
    return response.data
}

// Get all refund requests with filters
export const getRefundRequests = async (filters = {}) => {
    const api = createAuthRequest()
    const params = new URLSearchParams()
    
    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        params.append('paymentStatus', filters.paymentStatus)
    }
    if (filters.search) {
        params.append('search', filters.search)
    }

    const response = await api.get(`/refunds?${params.toString()}`)
    return response.data
}

// Process manual refund
export const processManualRefund = async (orderId, data) => {
    const api = createAuthRequest()
    const response = await api.post(`/refunds/${orderId}/process`, data)
    return response.data
}

// Get refund audit logs
export const getRefundLogs = async (orderId) => {
    const api = createAuthRequest()
    const response = await api.get(`/refunds/${orderId}/logs`)
    return response.data
}
