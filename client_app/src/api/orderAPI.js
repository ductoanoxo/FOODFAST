import axiosInstance from './axios'

export const orderAPI = {
    createOrder: (orderData) => axiosInstance.post('/orders', orderData),
    getOrders: () => axiosInstance.get('/orders'),
    getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
    cancelOrder: (id) => axiosInstance.patch(`/orders/${id}/cancel`),
    trackOrder: (id) => axiosInstance.get(`/orders/${id}/track`),
    getOrderHistory: (params) => axiosInstance.get('/orders/history', { params }),
    rateOrder: (id, rating) => axiosInstance.post(`/orders/${id}/rate`, rating),
    confirmDelivery: (id) => axiosInstance.post(`/orders/${id}/confirm-delivery`),
    calculateDeliveryFee: (data) => axiosInstance.post('/orders/calculate-fee', data),
}