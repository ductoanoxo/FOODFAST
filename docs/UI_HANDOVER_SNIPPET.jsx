// 📦 UI Implementation for Restaurant Handover Confirmation
// File: restaurant_app/src/pages/OrderDetailsPage.jsx (hoặc tương đương)

import React, { useState } from 'react';
import { Button, message, Tag, Modal } from 'antd';
import { CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import moment from 'moment';
import { restaurantConfirmHandover } from '../api/orderAPI';

// ============================================
// 1. Add state trong component
// ============================================
const [confirmingHandover, setConfirmingHandover] = useState(false);

// ============================================
// 2. Handler function
// ============================================
const handleConfirmHandover = async () => {
  Modal.confirm({
    title: 'Xác nhận giao hàng cho drone?',
    icon: <AlertOutlined />,
    content: `Bạn xác nhận đã giao đơn hàng ${order.orderNumber} cho drone ${order.drone?.name}?`,
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        setConfirmingHandover(true);
        
        const result = await restaurantConfirmHandover(order._id, order.drone._id);
        
        message.success({
          content: 'Đã xác nhận giao hàng cho drone thành công!',
          duration: 3,
        });
        
        // Refresh order details
        fetchOrderDetails(); // Gọi lại API để cập nhật order
        
      } catch (error) {
        console.error('Error confirming handover:', error);
        message.error({
          content: error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận',
          duration: 5,
        });
      } finally {
        setConfirmingHandover(false);
      }
    },
  });
};

// ============================================
// 3. Render button trong JSX (ví dụ: trong Card actions)
// ============================================
<Card 
  title={`Đơn hàng ${order.orderNumber}`}
  extra={<Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>}
>
  {/* Order details... */}
  
  {/* Drone info section */}
  {order.drone && (
    <div style={{ marginTop: 16, padding: 16, background: '#f0f5ff', borderRadius: 8 }}>
      <h4>🚁 Thông tin Drone</h4>
      <p><strong>Tên:</strong> {order.drone.name}</p>
      <p><strong>Model:</strong> {order.drone.model}</p>
      
      {/* Show picked up status if confirmed */}
      {order.pickedUpAt ? (
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ marginTop: 8 }}>
          ✅ Đã giao cho drone lúc {moment(order.pickedUpAt).format('HH:mm DD/MM/YYYY')}
        </Tag>
      ) : order.status === 'ready' ? (
        <div style={{ marginTop: 12 }}>
          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmHandover}
            loading={confirmingHandover}
          >
            ✅ Xác nhận đã giao cho drone
          </Button>
          <p style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
            Bấm nút này sau khi đã trao đồ ăn cho drone
          </p>
        </div>
      ) : null}
    </div>
  )}
  
  {/* Actions section */}
  <div style={{ marginTop: 20 }}>
    {/* Other action buttons... */}
  </div>
</Card>

// ============================================
// 4. Helper functions for status display
// ============================================
const getStatusColor = (status) => {
  const colors = {
    pending: 'default',
    confirmed: 'blue',
    preparing: 'orange',
    ready: 'gold',
    picked_up: 'cyan',
    delivering: 'purple',
    delivered: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng',
    picked_up: 'Đã giao cho drone',
    delivering: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };
  return texts[status] || status;
};

// ============================================
// 5. Socket listener (thêm trong useEffect)
// ============================================
useEffect(() => {
  // ... existing socket listeners
  
  // Listen for picked-up confirmation from other restaurant users
  socket.on('order:picked-up', (data) => {
    if (data.orderId === order._id) {
      message.info(`Đơn hàng ${data.orderNumber} đã được xác nhận giao cho drone`);
      fetchOrderDetails(); // Refresh
    }
  });
  
  return () => {
    socket.off('order:picked-up');
  };
}, [order]);

// ============================================
// 6. Alternative: Compact button in order list
// ============================================
// Nếu muốn hiện button trong danh sách orders (OrderListPage)
const OrderListItem = ({ order }) => (
  <List.Item
    actions={[
      order.status === 'ready' && order.drone && !order.pickedUpAt ? (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleQuickConfirm(order._id, order.drone._id);
          }}
        >
          Đã giao
        </Button>
      ) : order.pickedUpAt ? (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Đã giao
        </Tag>
      ) : null,
      <Button onClick={() => navigate(\`/orders/\${order._id}\`)}>Chi tiết</Button>
    ]}
  >
    {/* Order item content */}
  </List.Item>
);

// ============================================
// 7. Quick confirm handler for list view
// ============================================
const handleQuickConfirm = async (orderId, droneId) => {
  try {
    await restaurantConfirmHandover(orderId, droneId);
    message.success('Đã xác nhận!');
    fetchOrders(); // Refresh list
  } catch (error) {
    message.error(error.response?.data?.message || 'Có lỗi xảy ra');
  }
};

// ============================================
// 8. Notification component (optional)
// ============================================
// Hiển thị notification nổi bật khi có order ready và chờ confirm
const HandoverReminderBanner = ({ order }) => {
  if (order.status !== 'ready' || !order.drone || order.pickedUpAt) {
    return null;
  }
  
  return (
    <Alert
      message="🚁 Drone đã đến nhà hàng"
      description={
        <div>
          <p>Drone <strong>{order.drone.name}</strong> sẵn sàng nhận hàng.</p>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmHandover}
            loading={confirmingHandover}
          >
            Xác nhận đã giao
          </Button>
        </div>
      }
      type="warning"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

// ============================================
// NOTES:
// ============================================
// - Import các component và function cần thiết từ antd
// - Đảm bảo có socket.io-client setup trong app
// - fetchOrderDetails() là function để reload order từ API
// - Customize UI theo design system của project
// - Test cả happy path và error cases
// - Thêm loading states cho UX tốt hơn
