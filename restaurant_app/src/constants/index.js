// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.PREPARING]: 'Đang chuẩn bị',
  [ORDER_STATUS.READY]: 'Sẵn sàng giao',
  [ORDER_STATUS.DELIVERING]: 'Đang giao',
  [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'orange',
  [ORDER_STATUS.PREPARING]: 'blue',
  [ORDER_STATUS.READY]: 'cyan',
  [ORDER_STATUS.DELIVERING]: 'purple',
  [ORDER_STATUS.COMPLETED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  RICE: 'rice',
  NOODLES: 'noodles',
  DRINKS: 'drinks',
  SNACKS: 'snacks',
  DESSERTS: 'desserts',
  OTHER: 'other',
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.RICE]: '🍚 Cơm',
  [PRODUCT_CATEGORIES.NOODLES]: '🍜 Mì/Phở',
  [PRODUCT_CATEGORIES.DRINKS]: '🥤 Đồ uống',
  [PRODUCT_CATEGORIES.SNACKS]: '🍿 Đồ ăn vặt',
  [PRODUCT_CATEGORIES.DESSERTS]: '🍰 Tráng miệng',
  [PRODUCT_CATEGORIES.OTHER]: '🍽️ Khác',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  VNPAY: 'vnpay',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Tiền mặt',
  [PAYMENT_METHODS.VNPAY]: 'VNPay',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'restaurant_token',
  USER: 'restaurant_user',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

// Image Upload
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  DISPLAY_FULL: 'DD/MM/YYYY HH:mm:ss',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DD HH:mm:ss',
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công!',
    LOGOUT: 'Đăng xuất thành công!',
    CREATE: 'Tạo mới thành công!',
    UPDATE: 'Cập nhật thành công!',
    DELETE: 'Xóa thành công!',
  },
  ERROR: {
    LOGIN: 'Đăng nhập thất bại!',
    NETWORK: 'Lỗi kết nối mạng!',
    UNKNOWN: 'Có lỗi xảy ra, vui lòng thử lại!',
    UNAUTHORIZED: 'Bạn không có quyền truy cập!',
    NOT_FOUND: 'Không tìm thấy dữ liệu!',
  },
  CONFIRM: {
    DELETE: 'Bạn có chắc muốn xóa?',
    CANCEL: 'Bạn có chắc muốn hủy?',
    LOGOUT: 'Bạn có chắc muốn đăng xuất?',
  },
};

// Chart Colors
export const CHART_COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#38f9d7',
  '#fa709a',
  '#fee140',
];

// Notification Settings
export const NOTIFICATION_DURATION = 3; // seconds
export const NOTIFICATION_PLACEMENT = 'topRight';

// Auto Refresh Intervals
export const REFRESH_INTERVALS = {
  ORDERS: 30000, // 30 seconds
  DASHBOARD: 60000, // 1 minute
};
