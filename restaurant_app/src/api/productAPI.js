import axios from './axios';

// Get restaurant products
export const getRestaurantProducts = async () => {
  const response = await axios.get('/products/restaurant');
  return response.data;
};

// Create product
export const createProduct = async (productData) => {
  const response = await axios.post('/products', productData);
  return response.data;
};

// Update product
export const updateProduct = async (productId, productData) => {
  const response = await axios.put(`/products/${productId}`, productData);
  return response.data;
};

// Delete product
export const deleteProduct = async (productId) => {
  const response = await axios.delete(`/products/${productId}`);
  return response.data;
};

// Get categories
export const getCategories = async () => {
  const response = await axios.get('/categories');
  return response.data;
};
