import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
}

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload
            state.loading = false
        },
        updateOrder: (state, action) => {
            const index = state.orders.findIndex(o => o._id === action.payload._id)
            if (index !== -1) {
                state.orders[index] = action.payload
            }
        },
        selectOrder: (state, action) => {
            state.selectedOrder = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
    },
})

export const { 
    setOrders, 
    updateOrder, 
    selectOrder,
    setLoading,
    setError 
} = orderSlice.actions

export default orderSlice.reducer
