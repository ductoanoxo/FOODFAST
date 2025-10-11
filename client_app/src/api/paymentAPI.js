import axiosInstance from './axios'

export const paymentAPI = {
    createPayment: (paymentData) => axiosInstance.post('/payment/create', paymentData),
    verifyPayment: (paymentId, data) => axiosInstance.post(`/payment/${paymentId}/verify`, data),
    getPaymentMethods: () => axiosInstance.get('/payment/methods'),
    createVNPayPayment: (data) => axiosInstance.post('/payment/vnpay/create', data),
    vnpayReturn: (params) => axiosInstance.get('/payment/vnpay/return', { params }),
    createMomoPayment: (data) => axiosInstance.post('/payment/momo/create', data),
    momoCallback: (params) => axiosInstance.post('/payment/momo/callback', params),
    getPaymentInfo: (orderId) => axiosInstance.get(`/payment/${orderId}`),
}