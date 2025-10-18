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
    import axios from '../../api/axios';
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

        // Helper: get current restaurant id from localStorage (auth slice stores user)
        const getCurrentRestaurantId = () => {
          try {
            const user = JSON.parse(localStorage.getItem('restaurant_user') || 'null');
            return user && (user.restaurantId || user.restaurant || (user._id && user.role === 'restaurant' ? user._id : null))
              ? String(user.restaurantId || user.restaurant || user._id)
              : null;
          } catch (e) {
            return null;
          }
        };

        // Load notifications from localStorage (but only keep those belonging to
        // the current restaurant for this tab). This prevents notifications from
        // a previously-opened restaurant (e.g. KFC) showing up after the user
        // switches accounts.
        const saved = localStorage.getItem('restaurant_notifications');
        const currentIdOnLoad = getCurrentRestaurantId();
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const filtered = parsed.filter((n) => {
              // notification.restaurantId may be stored on the item itself (see addNotification below)
              const rid = n.restaurantId ?? n.data?.restaurantId ?? n.data?.order?.restaurantId ?? n.data?.restaurant?._id ?? null;
              return rid ? String(rid) === String(currentIdOnLoad) : false;
            });
            setNotifications(filtered);
            setUnreadCount(filtered.filter((n) => !n.read).length);
          } catch (e) {
            // if parse fails, clear
            setNotifications([]);
            setUnreadCount(0);
          }
        }

        // Listen for real-time notifications
        const socket = getSocket();

        

        // Store a per-tab copy of the current restaurant id so that incoming events
        // are filtered against the tab's active restaurant. This avoids races where
        // other tabs update shared localStorage and change the global value.
        const [tabRestaurantId, setTabRestaurantId] = (() => {
          // Create a small local state-like getter/setter using closure so we don't
          // need to refactor the entire component to use another useState here
          // inside the effect. We'll store the value on the socket object instead.
          const initial = getCurrentRestaurantId();
          return [initial, (v) => { /* placeholder replaced below after socket init */ }];
        })();

        // Verify if notification belongs to current restaurant (uses tabRestaurantId)
        const belongsToCurrentRestaurant = (payload = {}) => {
          const currentId = (getSocket().__tabRestaurantId) || tabRestaurantId || '';
          if (!currentId) return false;

          const payloadRid =
            payload.restaurantId ??
            payload.restaurant?._id ??
            payload.restaurant ??
            payload.order?.restaurantId ??
            payload.order?.restaurant?._id;

          return payloadRid ? String(payloadRid) === String(currentId) : false;
        };

        socket.on('new-order', (data) => {
          console.log('📦 Nhận sự kiện new-order:', data);
          if (belongsToCurrentRestaurant(data)) {
            addNotification({
              type: 'new-order',
              title: 'Đơn hàng mới',
              message: `Đơn hàng #${data.orderNumber} đã được đặt`,
              data,
              read: false,
            });
          } else {
            console.log('Notification filtered out (not for this restaurant):', data);
          }
        });

        socket.on('order-status-updated', (data) => {
          console.log('🔁 Nhận sự kiện order-status-updated:', data);
          if (belongsToCurrentRestaurant(data)) {
            addNotification({
              type: 'status-update',
              title: 'Cập nhật đơn hàng',
              message: `Đơn hàng #${data.orderNumber} đã ${getStatusText(data.status)}`,
              data,
              read: false,
            });
          } else {
            console.log('Notification filtered out (status update not for this restaurant):', data);
          }
        });

        socket.on('restaurant:order:completed', (data) => {
          console.log('✅ Nhận sự kiện restaurant:order:completed:', data);
          if (belongsToCurrentRestaurant(data)) {
            addNotification({
              type: 'success',
              title: 'Đơn hàng hoàn thành',
              message: `Đơn hàng #${data.orderNumber} đã được giao thành công`,
              data,
              read: false,
            });
          } else {
            console.log('Notification filtered out (order completed not for this restaurant):', data);
          }
        });
        
        // After socket is available, stash the tab-local restaurant id on the socket
        // so that listeners can access an immutable per-tab value even if
        // localStorage changes in other tabs. Also provide a setter via the same
        // property for controlled updates.
        try {
          const rid = getCurrentRestaurantId();
          socket.__tabRestaurantId = rid;
          socket.__setTabRestaurantId = (v) => { socket.__tabRestaurantId = v; };
        } catch (e) {
          // ignore
        }

        // Listen to storage events so that if the user intentionally switches
        // account/restaurant in another tab we update the per-tab id (optional).
        const handleStorage = (e) => {
          if (e.key === 'restaurant_user') {
            try {
              const newId = getCurrentRestaurantId();
              if (socket.__setTabRestaurantId) socket.__setTabRestaurantId(newId);
              // Update visible notifications for this tab to match the new restaurant
              if (!newId) {
                // logged out -> clear visible notifications for this tab
                setNotifications([]);
                setUnreadCount(0);
              } else {
                const savedNow = localStorage.getItem('restaurant_notifications');
                if (savedNow) {
                  try {
                    const parsedNow = JSON.parse(savedNow);
                    const filteredNow = parsedNow.filter((n) => {
                      const rid = n.restaurantId ?? n.data?.restaurantId ?? n.data?.order?.restaurantId ?? n.data?.restaurant?._id ?? null;
                      return rid ? String(rid) === String(newId) : false;
                    }).slice(0, 50);
                    setNotifications(filteredNow);
                    setUnreadCount(filteredNow.filter((n) => !n.read).length);
                  } catch (err) {
                    setNotifications([]);
                    setUnreadCount(0);
                  }
                } else {
                  setNotifications([]);
                  setUnreadCount(0);
                }
              }
            } catch (err) { /* ignore */ }
          }
        };
        window.addEventListener('storage', handleStorage);

        return () => {
          socket.off('new-order');
          socket.off('order-status-updated');
          socket.off('restaurant:order:completed');
          window.removeEventListener('storage', handleStorage);
        };
      }, []);

      const addNotification = (notification) => {
        // Ensure we record the restaurantId on each saved notification for fast
        // filtering later.
        const extractRestaurantId = (payload = {}) => {
          return (
            payload.restaurantId ??
            payload.restaurant?._id ??
            payload.restaurant ??
            payload.order?.restaurantId ??
            payload.order?.restaurant?._id ??
            null
          );
        };

        const newNotification = {
          ...notification,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          restaurantId: extractRestaurantId(notification.data) || getSocket().__tabRestaurantId || null,
        };

        setNotifications((prev) => {
          // Keep a global list in localStorage but maintain per-tab filtering when
          // showing. Save newest first, cap at 200 globally to avoid infinite growth.
          try {
            const raw = localStorage.getItem('restaurant_notifications');
            const globalPrev = raw ? JSON.parse(raw) : [];
            const updatedGlobal = [newNotification, ...globalPrev];
            const capped = updatedGlobal.slice(0, 200);
            localStorage.setItem('restaurant_notifications', JSON.stringify(capped));
            // For this tab view we only show notifications matching this tab's restaurant
            const tabRid = getSocket().__tabRestaurantId || null;
            const tabView = capped.filter((n) => (n.restaurantId ? String(n.restaurantId) === String(tabRid) : false)).slice(0, 50);
            return tabView;
          } catch (e) {
            // Fallback: just insert into local state
            const updated = [newNotification, ...prev].slice(0, 50);
            localStorage.setItem('restaurant_notifications', JSON.stringify(updated));
            return updated;
          }
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

      // Debug helper: print key runtime values to console for diagnosis
      const debugPrint = () => {
        try {
          const userRaw = localStorage.getItem('restaurant_user');
          try {
            console.log('DEBUG restaurant_user (parsed):', JSON.parse(userRaw || 'null'));
          } catch (e) {
            console.log('DEBUG restaurant_user (raw):', userRaw);
          }
        } catch (e) {
          console.log('DEBUG restaurant_user: error reading localStorage', e);
        }

        try {
          const sock = getSocket();
          console.log('DEBUG socket.__tabRestaurantId:', sock && sock.__tabRestaurantId);
          console.log('DEBUG socket id:', sock && sock.id);
        } catch (e) {
          console.log('DEBUG socket: getSocket() error', e);
        }

        try {
          const raw = localStorage.getItem('restaurant_notifications');
          const parsed = raw ? JSON.parse(raw) : [];
          console.log('DEBUG restaurant_notifications count:', parsed.length);
          console.log('DEBUG restaurant_notifications preview (first 10):', parsed.slice(0, 10));
        } catch (e) {
          console.log('DEBUG restaurant_notifications: error parsing', e, 'raw:', localStorage.getItem('restaurant_notifications'));
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {notifications.length > 0 && (
                  <Button type="link" size="small" onClick={markAllAsRead}>
                    Đánh dấu đã đọc
                  </Button>
                )}
                <Button type="default" size="small" onClick={debugPrint}>
                  Debug
                </Button>
              </div>
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