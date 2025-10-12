import axios from './axios';

// Lấy tất cả categories
export const getCategories = async () => {
  try {
    const response = await axios.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải danh mục';
  }
};

// Lấy 1 category theo ID
export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải danh mục';
  }
};

// Tạo category mới
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tạo danh mục';
  }
};

// Cập nhật category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể cập nhật danh mục';
  }
};

// Xóa category
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể xóa danh mục';
  }
};

// Lấy sản phẩm của category
export const getCategoryProducts = async (id) => {
  try {
    const response = await axios.get(`/categories/${id}/products`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải sản phẩm';
  }
};

// Lấy categories có sản phẩm của nhà hàng
export const getCategoriesWithProducts = async () => {
  try {
    const response = await axios.get('/categories/restaurant/with-products');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải danh mục';
  }
};
