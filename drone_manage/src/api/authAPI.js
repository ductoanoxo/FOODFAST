import API from './axios'

// Login
export const login = async (credentials) => {
    const response = await API.post('/auth/login', credentials)
    return response.data
}

// Get current user
export const getCurrentUser = async () => {
    const response = await API.get('/auth/me')
    return response.data
}

// Logout
export const logout = async () => {
    const response = await API.post('/auth/logout')
    return response.data
}
