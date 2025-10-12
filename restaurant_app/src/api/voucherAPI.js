import axios from './axios'

export const getVouchers = async () => {
    const response = await axios.get('/vouchers')
    return response.data
}

export const getVoucher = async (id) => {
    const response = await axios.get(`/vouchers/${id}`)
    return response.data
}

export const createVoucher = async (voucherData) => {
    const response = await axios.post('/vouchers', voucherData)
    return response.data
}

export const updateVoucher = async (id, voucherData) => {
    const response = await axios.put(`/vouchers/${id}`, voucherData)
    return response.data
}

export const deleteVoucher = async (id) => {
    const response = await axios.delete(`/vouchers/${id}`)
    return response.data
}

export const getVoucherStats = async (id) => {
    const response = await axios.get(`/vouchers/${id}/stats`)
    return response.data
}
