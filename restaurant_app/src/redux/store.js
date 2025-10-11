import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import orderReducer from './slices/orderSlice'
import productReducer from './slices/productSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        orders: orderReducer,
        products: productReducer,
    },
})