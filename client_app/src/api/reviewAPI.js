import axiosInstance from './axios'

export const reviewAPI = {
    // Tạo đánh giá mới cho sản phẩm
    createReview: (reviewData) => 
        axiosInstance.post('/reviews', reviewData),
    
    // Lấy đánh giá theo sản phẩm
    getProductReviews: (productId) => 
        axiosInstance.get(`/reviews/product/${productId}`),
    
    // Lấy đánh giá theo nhà hàng
    getRestaurantReviews: (restaurantId) => 
        axiosInstance.get(`/reviews/restaurant/${restaurantId}`),
    
    // Lấy đánh giá của user
    getUserReviews: (userId) => 
        axiosInstance.get(`/reviews/user/${userId}`),
    
    // Cập nhật đánh giá
    updateReview: (reviewId, reviewData) => 
        axiosInstance.put(`/reviews/${reviewId}`, reviewData),
    
    // Xóa đánh giá
    deleteReview: (reviewId) => 
        axiosInstance.delete(`/reviews/${reviewId}`),
}
