import axiosInstance from './axios'

export const reviewAPI = {
    // Lấy tất cả đánh giá của nhà hàng
    getRestaurantReviews: () => 
        axiosInstance.get('/reviews/restaurant'),
    
    // Lấy đánh giá theo sản phẩm
    getProductReviews: (productId) => 
        axiosInstance.get(`/reviews/product/${productId}`),
    
    // Phản hồi đánh giá (restaurant owner)
    replyToReview: (reviewId, reply) => 
        axiosInstance.put(`/reviews/${reviewId}/reply`, { reply }),
}
