import axiosInstance from './axios'

export const restaurantAPI = {
    getRestaurants: (params) => axiosInstance.get('/restaurants', { params }),
    getRestaurantById: (id) => axiosInstance.get(`/restaurants/${id}`),
    getRestaurantMenu: (id) => axiosInstance.get(`/restaurants/${id}/menu`),
    getNearbyRestaurants: (location) => axiosInstance.get('/restaurants/nearby', {
        params: { lat: location.lat, lng: location.lng }
    }),
    getRestaurantReviews: (id) => axiosInstance.get(`/restaurants/${id}/reviews`),
    addReview: (restaurantId, reviewData) =>
        axiosInstance.post(`/restaurants/${restaurantId}/reviews`, reviewData),
}