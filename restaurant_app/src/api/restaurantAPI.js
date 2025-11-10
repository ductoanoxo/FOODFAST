import axios from './axios';

// =============== RESTAURANT INFO ===============
export const getRestaurantInfo = async () => {
  try {
    // Lấy user info để có restaurant ID (endpoint hiện tại trên server là /auth/profile)
    const userResponse = await axios.get('/auth/profile');
    const restaurant = userResponse.data.data.restaurant;
    
    // Extract ID nếu là object, nếu không thì dùng trực tiếp
    const restaurantId = typeof restaurant === 'object' ? restaurant._id : restaurant;
    
    // Lấy thông tin restaurant
    const response = await axios.get(`/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải thông tin nhà hàng';
  }
};

export const updateRestaurantInfo = async (formData) => {
  try {
    // Lấy restaurant ID từ user
    const userResponse = await axios.get('/auth/profile');
    const restaurant = userResponse.data.data.restaurant;
    const restaurantId = typeof restaurant === 'object' ? restaurant._id : restaurant;
    
    // Cập nhật thông tin
    const response = await axios.put(`/restaurants/${restaurantId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể cập nhật thông tin';
  }
};

// =============== STATISTICS ===============
export const getRestaurantStats = async (params = {}) => {
  try {
    // Lấy restaurant ID
    const userResponse = await axios.get('/auth/profile');
    const restaurant = userResponse.data.data.restaurant;
    
    if (!restaurant) {
      throw new Error('Không tìm thấy thông tin nhà hàng');
    }
    
    const restaurantId = typeof restaurant === 'object' ? restaurant._id : restaurant;
    
    if (!restaurantId) {
      throw new Error('Restaurant ID không hợp lệ');
    }
    
    const response = await axios.get(`/restaurants/${restaurantId}/stats`, { 
      params,
      timeout: 30000 // Increase timeout for stats endpoint
    });
    return response.data;
  } catch (error) {
    console.error('getRestaurantStats error:', error);
    throw error.response?.data?.message || error.message || 'Không thể tải thống kê';
  }
};

export const getRestaurantOrders = async (params = {}) => {
  try {
    // Lấy restaurant ID
    const userResponse = await axios.get('/auth/profile');
    const restaurant = userResponse.data.data.restaurant;
    
    if (!restaurant) {
      throw new Error('Không tìm thấy thông tin nhà hàng');
    }
    
    const restaurantId = typeof restaurant === 'object' ? restaurant._id : restaurant;
    
    if (!restaurantId) {
      throw new Error('Restaurant ID không hợp lệ');
    }
    
    const response = await axios.get(`/restaurants/${restaurantId}/orders`, { 
      params,
      timeout: 30000 // Increase timeout for orders endpoint
    });
    return response.data;
  } catch (error) {
    console.error('getRestaurantOrders error:', error);
    throw error.response?.data?.message || error.message || 'Không thể tải đơn hàng';
  }
};

export const getRestaurantMenu = async () => {
  try {
    // Lấy restaurant ID
    const userResponse = await axios.get('/auth/profile');
    const restaurant = userResponse.data.data.restaurant;
    
    if (!restaurant) {
      throw new Error('Không tìm thấy thông tin nhà hàng');
    }
    
    const restaurantId = typeof restaurant === 'object' ? restaurant._id : restaurant;
    
    if (!restaurantId) {
      throw new Error('Restaurant ID không hợp lệ');
    }
    
    const response = await axios.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
  } catch (error) {
    console.error('getRestaurantMenu error:', error);
    throw error.response?.data?.message || error.message || 'Không thể tải menu';
  }
};

// =============== REVENUE & TOP PRODUCTS ===============
export const getRevenueReport = async (params = {}) => {
  try {
    const response = await getRestaurantOrders(params);
    const orders = response.data || [];
    
    // Group by date/week/month based on period
    const period = params.period || 'day';
    const revenueMap = {};
    const ordersMap = {};
    
    orders.forEach(order => {
      // Count all orders for chart, but only delivered for revenue
      const date = new Date(order.createdAt);
      let key;
      
      if (period === 'day') {
        key = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }); // DD/MM
      } else if (period === 'week') {
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `Tuần ${weekNum}/${date.getMonth() + 1}`;
      } else {
        key = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      }
      
      if (!revenueMap[key]) {
        revenueMap[key] = 0;
        ordersMap[key] = 0;
      }
      
      // Only count revenue for delivered/completed orders
      if (order.status === 'delivered' || order.status === 'completed') {
        revenueMap[key] += order.totalAmount || 0;
      }
      
      // Count all orders
      ordersMap[key] += 1;
    });
    
    // Convert to array and sort
    const data = Object.entries(revenueMap).map(([date, revenue]) => ({
      date,
      revenue,
      orders: ordersMap[date] || 0,
    })).sort((a, b) => {
      // Sort by date
      const dateA = a.date.split('/');
      const dateB = b.date.split('/');
      return new Date(2024, dateA[1] - 1, dateA[0]) - new Date(2024, dateB[1] - 1, dateB[0]);
    });
    
    return { data };
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải báo cáo doanh thu';
  }
};

export const getTopProducts = async (params = {}) => {
  try {
    const response = await getRestaurantOrders(params);
    const orders = response.data || [];
    
    // Count product sales from delivered/completed orders only
    const productMap = {};
    
    orders.forEach(order => {
      if (order.status === 'delivered' || order.status === 'completed') {
        (order.items || []).forEach(item => {
          const productId = item.product?._id || item.product;
          const productName = item.product?.name || item.name || 'Unknown';
          
          if (!productMap[productId]) {
            productMap[productId] = {
              name: productName,
              sales: 0,
              revenue: 0,
            };
          }
          
          productMap[productId].sales += item.quantity || 0;
          productMap[productId].revenue += (item.price || 0) * (item.quantity || 0);
        });
      }
    });
    
    // Convert to array and sort by sales
    const data = Object.entries(productMap)
      .map(([id, info]) => ({
        _id: id,
        name: info.name,
        sales: info.sales,
        revenue: info.revenue,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, params.limit || 5);
    
    return { data };
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải món bán chạy';
  }
};

// =============== REVIEWS ===============
export const getRestaurantReviews = async (params = {}) => {
  try {
    // Lấy restaurant ID
    const userResponse = await axios.get('/auth/profile');
    const restaurant = userResponse.data.data.restaurant;
    const restaurantId = typeof restaurant === 'object' ? restaurant._id : restaurant;
    
    // Gọi API lấy reviews của restaurant
    const response = await axios.get(`/reviews/restaurant/${restaurantId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải đánh giá';
  }
};

// Update review (for adding restaurant responses)
export const updateReview = async (reviewId, data) => {
  try {
    const response = await axios.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể cập nhật đánh giá';
  }
};
