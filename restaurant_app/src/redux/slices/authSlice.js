import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: JSON.parse(localStorage.getItem('restaurant_user')) || null,
    token: localStorage.getItem('restaurant_token') || null,
    isAuthenticated: !!localStorage.getItem('restaurant_token'),
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
            localStorage.setItem('restaurant_user', JSON.stringify(action.payload.user))
            localStorage.setItem('restaurant_token', action.payload.token)
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('restaurant_user')
            localStorage.removeItem('restaurant_token')
        },
    },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer