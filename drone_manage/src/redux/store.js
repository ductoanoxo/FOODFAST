import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import droneReducer from './slices/droneSlice'
import missionReducer from './slices/missionSlice'
import orderReducer from './slices/orderSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        drone: droneReducer,
        mission: missionReducer,
        order: orderReducer,
    },
})