import axios from './axios'

export const getPublicVouchers = async (restaurantId) => {
    const response = await axios.get(`/vouchers/public/${restaurantId}`)
    return response.data
}

export const validateVoucher = async (voucherData) => {
    const response = await axios.post('/vouchers/validate', voucherData)
    return response.data
}
