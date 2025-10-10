import axiosInstance from './axios'

export const productAPI = {
    getProducts: (params) => axiosInstance.get('/products', { params }),
    getProductById: (id) => axiosInstance.get(`/products/${id}`),
    searchProducts: (query) => axiosInstance.get('/products/search', { params: { q: query } }),
    getCategories: () => axiosInstance.get('/categories'),
    getProductsByCategory: (categoryId) => axiosInstance.get(`/categories/${categoryId}/products`),
    getProductsByRestaurant: (restaurantId) => axiosInstance.get(`/restaurants/${restaurantId}/products`),
    getPopularProducts: () => axiosInstance.get('/products/popular'),
    getRecommendations: () => axiosInstance.get('/products/recommendations'),
}