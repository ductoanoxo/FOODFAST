import axios from './axios';

// Get all users
export const getAllUsers = async (filters) => {
  const response = await axios.get('/users', { params: filters });
  return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

// Update user
export const updateUser = async (userId, userData) => {
  const response = await axios.put(`/users/${userId}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
  const response = await axios.delete(`/users/${userId}`);
  return response.data;
};

// Update user status
export const updateUserStatus = async (userId, isActive) => {
  const response = await axios.patch(`/users/${userId}/status`, { isActive });
  return response.data;
};
