import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import droneReducer from './slices/droneSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        drone: droneReducer,
    },
})