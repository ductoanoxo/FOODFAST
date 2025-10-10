import { createSlice } from '@reduxjs/toolkit'

const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user')
        return user && user !== 'undefined' ? JSON.parse(user) : null
    } catch (error) {
        localStorage.removeItem('user')
        return null
    }
}

const initialState = {
    user: getUserFromStorage(),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true
            state.error = null
        },
        loginSuccess: (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload.user
            state.token = action.payload.token
            localStorage.setItem('user', JSON.stringify(action.payload.user))
            localStorage.setItem('token', action.payload.token)
        },
        loginFailure: (state, action) => {
            state.loading = false
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        },
        updateUser: (state, action) => {
            state.user = {...state.user, ...action.payload }
            localStorage.setItem('user', JSON.stringify(state.user))
        },
    },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions
export default authSlice.reducer