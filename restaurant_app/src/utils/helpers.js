import { 
  ORDER_STATUS_COLORS, 
  ORDER_STATUS_LABELS,
  PRODUCT_CATEGORY_LABELS,
  DATE_FORMATS 
} from '../constants';
import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date, format = DATE_FORMATS.DISPLAY_TIME) => {
  return dayjs(date).format(format);
};

export const getStatusColor = (status) => {
  return ORDER_STATUS_COLORS[status] || 'default';
};

export const getStatusText = (status) => {
  return ORDER_STATUS_LABELS[status] || status;
};

export const getCategoryText = (category) => {
  return PRODUCT_CATEGORY_LABELS[category] || category;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10,11}$/;
  return re.test(phone);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return ((value / total) * 100).toFixed(1);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const isValidImageType = (type) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(type);
};

export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' năm trước';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' tháng trước';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' ngày trước';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' giờ trước';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' phút trước';
  
  return 'Vừa xong';
};
