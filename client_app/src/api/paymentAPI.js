import axiosInstance from './axios'

export const paymentAPI = {
    createPayment: (paymentData) => axiosInstance.post('/payment/create', paymentData),
    verifyPayment: (paymentId, data) => axiosInstance.post(`/payment/${paymentId}/verify`, data),
    getPaymentMethods: () => axiosInstance.get('/payment/methods'),
    vnpayReturn: (params) => axiosInstance.get('/payment/vnpay-return', { params }),
    momoReturn: (params) => axiosInstance.get('/payment/momo-return', { params }),
}