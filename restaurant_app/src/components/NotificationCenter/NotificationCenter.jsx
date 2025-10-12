import { useState, useEffect } from 'react';
import { Badge, Drawer, List, Avatar, Typography, Button, Empty, Tag } from 'antd';
import {
  BellOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getSocket } from '../../utils/socket';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import './NotificationCenter.css';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const NotificationCenter = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Load notifications from localStorage
    const saved = localStorage.getItem('restaurant_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n) => !n.read).length);
    }

    // Listen for real-time notifications
    const socket = getSocket();
    
    socket.on('new-order', (data) => {
      console.log('📦 Nhận sự kiện new-order:', data); // <== thêm dòng này
      addNotification({
        type: 'new-order',
        title: 'Đơn hàng mới',
        message: `Đơn hàng #${data.orderNumber} đã được đặt`,
        data,
        read: false,
      });
    });

    socket.on('order-status-updated', (data) => {
      console.log('🔁 Nhận sự kiện order-status-updated:', data); // <== thêm dòng này
      addNotification({
        type: 'status-update',
        title: 'Cập nhật đơn hàng',
        message: `Đơn hàng #${data.orderNumber} đã ${getStatusText(data.status)}`,
        data,
        read: false,
      });
    });
    
    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    
    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('restaurant_notifications', JSON.stringify(updated));
      return updated;
    });
    
    setUnreadCount((prev) => prev + 1);

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
      });
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'chờ xác nhận',
      confirmed: 'được xác nhận',
      preparing: 'đang chuẩn bị',
      ready: 'sẵn sàng giao',
      delivering: 'đang giao',
      delivered: 'giao thành công',
      cancelled: 'bị hủy',
    };
    return statusMap[status] || status;
  };

  const getIcon = (type) => {
    const iconMap = {
      'new-order': <ShoppingOutlined style={{ color: '#1890ff' }} />,
      'status-update': <ClockCircleOutlined style={{ color: '#faad14' }} />,
      success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    };
    return iconMap[type] || <BellOutlined />;
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('restaurant_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('restaurant_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('restaurant_notifications');
  };

  return (
    <>
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          onClick={() => setVisible(true)}
          style={{ border: 'none' }}
        />
      </Badge>

      <Drawer
        title="Thông báo"
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={400}
        extra={
          notifications.length > 0 && (
            <Button type="link" size="small" onClick={markAllAsRead}>
              Đánh dấu đã đọc
            </Button>
          )
        }
        footer={
          notifications.length > 0 && (
            <Button block onClick={clearAll}>
              Xóa tất cả
            </Button>
          )
        }
      >
        {notifications.length === 0 ? (
          <Empty
            description="Không có thông báo nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                onClick={() => !item.read && markAsRead(item.id)}
                style={{
                  cursor: 'pointer',
                  background: item.read ? 'transparent' : '#f0f5ff',
                  padding: '12px',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getIcon(item.type)}
                      style={{
                        background: item.read ? '#f0f0f0' : '#e6f7ff',
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong={!item.read}>{item.title}</Text>
                      {!item.read && (
                        <Tag color="blue" style={{ margin: 0 }}>
                          Mới
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <>
                      <div>{item.message}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.timestamp).fromNow()}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};

export default NotificationCenter;