import axios from './axios';

// Get all restaurants
export const getAllRestaurants = async (filters) => {
  const response = await axios.get('/restaurants', { params: filters });
  return response.data;
};

// Get restaurant by ID
export const getRestaurantById = async (restaurantId) => {
  const response = await axios.get(`/restaurants/${restaurantId}`);
  return response.data;
};

// Create restaurant
export const createRestaurant = async (restaurantData) => {
  const response = await axios.post('/restaurants', restaurantData);
  return response.data;
};

// Update restaurant
export const updateRestaurant = async (restaurantId, restaurantData) => {
  const response = await axios.put(`/restaurants/${restaurantId}`, restaurantData);
  return response.data;
};

// Delete restaurant
export const deleteRestaurant = async (restaurantId) => {
  const response = await axios.delete(`/restaurants/${restaurantId}`);
  return response.data;
};

// Update restaurant status
export const updateRestaurantStatus = async (restaurantId, isOpen) => {
  const response = await axios.patch(`/restaurants/${restaurantId}/status`, { isOpen });
  return response.data;
};
