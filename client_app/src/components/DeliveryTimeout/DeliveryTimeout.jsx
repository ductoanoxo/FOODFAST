import { useState, useEffect } from 'react';
import { Alert, Progress, Typography } from 'antd';
import { ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

/**
 * Component hiển thị thời gian đếm ngược khi drone đang chờ khách nhận hàng
 */
const DeliveryTimeout = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    // Debug log
    console.log('🔍 DeliveryTimeout - Order status:', order?.status);
    console.log('🔍 DeliveryTimeout - ArrivedAt:', order?.arrivedAt);
    
    // Chỉ hiển thị khi drone đang chờ khách (waiting_for_customer)
    if (order?.status !== 'waiting_for_customer' || !order?.arrivedAt) {
      return;
    }

    const WAIT_TIME_MS = 40 * 1000; // 40 giây (DEMO MODE)
    // const WAIT_TIME_MS = 5 * 60 * 1000; // 5 phút (production)
    const arrivedTime = new Date(order.arrivedAt).getTime();
    const timeoutTime = arrivedTime + WAIT_TIME_MS;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = timeoutTime - now;

      if (remaining <= 0) {
        setTimeLeft(0);
        setPercentage(0);
        return;
      }

      // Tính phần trăm thời gian còn lại
      const percent = (remaining / WAIT_TIME_MS) * 100;
      setPercentage(percent);

      // Format thời gian còn lại
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Update ngay lập tức
    updateTimer();

    // Update mỗi giây
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order?.status, order?.arrivedAt]);

  // Không hiển thị nếu không phải trạng thái waiting_for_customer
  if (order?.status !== 'waiting_for_customer' || timeLeft === null) {
    return null;
  }

  // Xác định màu sắc dựa trên thời gian còn lại
  const getAlertType = () => {
    if (percentage > 50) return 'info';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  const getProgressColor = () => {
    if (percentage > 50) return '#1890ff'; // Blue
    if (percentage > 20) return '#faad14'; // Orange
    return '#ff4d4f'; // Red
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {percentage > 20 ? (
              <ClockCircleOutlined style={{ fontSize: '20px' }} />
            ) : (
              <WarningOutlined style={{ fontSize: '20px' }} />
            )}
            <Text strong>
              {percentage > 0 
                ? `Drone đang chờ bạn nhận hàng - Còn ${timeLeft}`
                : 'Hết thời gian chờ!'
              }
            </Text>
          </div>
        }
        description={
          <div>
            <Progress
              percent={percentage}
              strokeColor={getProgressColor()}
              showInfo={false}
              style={{ marginBottom: '8px' }}
            />
            <Text type="secondary">
              {percentage > 0 
                ? 'Vui lòng ra ngoài nhận hàng. Sau khi hết thời gian, drone sẽ quay về nhà hàng.'
                : 'Drone đã quay lại nhà hàng. Vui lòng liên hệ nhà hàng để sắp xếp giao hàng lại.'
              }
            </Text>
          </div>
        }
        type={getAlertType()}
        showIcon
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
};

DeliveryTimeout.propTypes = {
  order: PropTypes.shape({
    status: PropTypes.string,
    arrivedAt: PropTypes.string,
  }),
};

export default DeliveryTimeout;
