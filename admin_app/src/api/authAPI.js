import axios from './axios';

// Login
export const login = async(credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
};

// Get current user
export const getCurrentUser = async() => {
    const response = await axios.get('/auth/me');
    return response.data;
};

// Logout
export const logout = async() => {
    const response = await axios.post('/auth/logout');
    return response.data;
};

// Check if email exists
export const checkEmailExists = async(email) => {
    const response = await axios.get(`/users/check-email?email=${encodeURIComponent(email)}`);
    return response.data;
};