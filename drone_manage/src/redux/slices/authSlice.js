import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: JSON.parse(localStorage.getItem('drone_user')) || null,
    token: localStorage.getItem('drone_token') || null,
    isAuthenticated: !!localStorage.getItem('drone_token'),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
            localStorage.setItem('drone_user', JSON.stringify(action.payload.user))
            localStorage.setItem('drone_token', action.payload.token)
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('drone_user')
            localStorage.removeItem('drone_token')
        },
    },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer