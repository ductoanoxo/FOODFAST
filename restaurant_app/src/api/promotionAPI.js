import axios from './axios'

export const getPromotions = async () => {
    const response = await axios.get('/promotions')
    return response.data
}

export const createPromotion = async (data) => {
    const response = await axios.post('/promotions', data)
    return response.data
}

export const updatePromotion = async (id, data) => {
    const response = await axios.put(`/promotions/${id}`, data)
    return response.data
}

export const deletePromotion = async (id) => {
    const response = await axios.delete(`/promotions/${id}`)
    return response.data
}

export const togglePromotionStatus = async (id) => {
    const response = await axios.patch(`/promotions/${id}/toggle`)
    return response.data
}
