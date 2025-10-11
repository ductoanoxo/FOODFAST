import API from './axios'

// Get all orders (for drone delivery)
export const getAllOrders = async (params) => {
    const response = await API.get('/orders', { params })
    return response.data
}

// Get order by ID
export const getOrderById = async (id) => {
    const response = await API.get(`/orders/${id}`)
    return response.data
}

// Update order status
export const updateOrderStatus = async (id, status) => {
    const response = await API.patch(`/orders/${id}/status`, { status })
    return response.data
}

// Update delivery location
export const updateDeliveryLocation = async (id, location) => {
    const response = await API.patch(`/orders/${id}/location`, location)
    return response.data
}

// Get pending deliveries
export const getPendingDeliveries = async () => {
    const response = await API.get('/orders/pending-deliveries')
    return response.data
}

// Assign drone to order
export const assignDroneToOrder = async (orderId, droneId) => {
    const response = await API.patch(`/orders/${orderId}/assign-drone`, { droneId })
    return response.data
}
