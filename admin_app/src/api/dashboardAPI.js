import axios from './axios'

// Get dashboard statistics
export const getDashboardStats = async () => {
    const response = await axios.get('/dashboard/stats')
    return response.data
}

// Get recent orders
export const getRecentOrders = async (limit = 10) => {
    const response = await axios.get('/dashboard/recent-orders', {
        params: { limit }
    })
    return response.data
}

// Get top restaurants
export const getTopRestaurants = async (limit = 5) => {
    const response = await axios.get('/dashboard/top-restaurants', {
        params: { limit }
    })
    return response.data
}

// Get order statistics by date
export const getOrderStatistics = async (days = 7) => {
    const response = await axios.get('/dashboard/order-stats', {
        params: { days }
    })
    return response.data
}
