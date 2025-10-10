import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    trackingData: null,
}

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setTrackingData: (state, action) => {
            state.trackingData = action.payload
        },
        updateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload
            const order = state.orders.find(o => o._id === orderId)
            if (order) {
                order.status = status
            }
            if (state.currentOrder && state.currentOrder._id === orderId) {
                state.currentOrder.status = status
            }
        },
    },
})

export const {
    setOrders,
    setCurrentOrder,
    setLoading,
    setError,
    setTrackingData,
    updateOrderStatus
} = orderSlice.actions

export default orderSlice.reducer