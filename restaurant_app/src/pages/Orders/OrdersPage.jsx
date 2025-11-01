import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Tabs, Spin, Empty, Row, Col, message, notification } from 'antd';
import { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import { restaurantConfirmHandover } from '../../api/orderAPI';
import OrderCard from '../../components/OrderCard';
import OrderDetailModal from '../../components/OrderDetailModal';
import { 
  onNewOrder, 
  onOrderStatusUpdate, 
  onDroneAssigned,
  offNewOrder, 
  offOrderStatusUpdate,
  offDroneAssigned 
} from '../../utils/socket';
import './OrdersPage.css';

const { Title, Text } = Typography;

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
    
    // Socket.IO event listeners
    onNewOrder((newOrder) => {
      console.log('Received new order notification:', newOrder);
      notification.success({
        message: '🔔 Đơn hàng mới!',
        description: `Bạn có đơn hàng mới từ ${newOrder.user?.name || 'Khách hàng'}`,
        duration: 5,
      });
      dispatch(fetchOrders());
    });

    onOrderStatusUpdate((updatedOrder) => {
      notification.info({
        message: 'Đơn hàng đã cập nhật',
        description: `Đơn hàng #${updatedOrder.orderNumber || updatedOrder.orderId?.slice(-6).toUpperCase()} đã được cập nhật`,
        duration: 3,
      });
      dispatch(fetchOrders());
    });

    // NEW: Listen for drone assignment
    onDroneAssigned((data) => {
      console.log('Drone assigned to order:', data);
      notification.success({
        message: '🚁 Drone đã được phân công!',
        description: `Drone ${data.drone?.name || data.drone?.model} đã được phân công cho đơn hàng #${data.orderNumber || data.orderId?.slice(-6).toUpperCase()}`,
        duration: 5,
      });
      dispatch(fetchOrders()); // Refresh to get updated order with drone info
    });

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 30000);

    return () => {
      clearInterval(interval);
      offNewOrder();
      offOrderStatusUpdate();
      offDroneAssigned(); // NEW
    };
  }, [dispatch]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      message.success('Cập nhật trạng thái đơn hàng thành công!');
      dispatch(fetchOrders());
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error || 'Vui lòng thử lại'));
    }
  };

  const handleConfirmHandover = async (orderId, droneId) => {
    try {
      await restaurantConfirmHandover(orderId, droneId);
      message.success('✅ Đã xác nhận giao hàng cho drone!');
      dispatch(fetchOrders());
    } catch (error) {
      console.error('Error confirming handover:', error);
      message.error(error.response?.data?.message || 'Không thể xác nhận giao hàng');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filterOrders = (status) => {
    if (status === 'all') return orders;
    if (status === 'completed') return orders.filter((order) => order.status === 'completed' || order.status === 'delivered');
    // ✅ Tab "Đang giao" hiển thị cả picked_up (đã giao cho drone) và delivering (đang bay)
    if (status === 'delivering') return orders.filter((order) => order.status === 'picked_up' || order.status === 'delivering');
    return orders.filter((order) => order.status === status);
  };

  const tabItems = [
    {
      key: 'all',
      label: `Tất cả (${orders.length})`,
    },
    {
      key: 'pending',
      label: `Chờ xác nhận (${orders.filter((o) => o.status === 'pending').length})`,
    },
    {
      key: 'preparing',
      label: `Đang chuẩn bị (${orders.filter((o) => o.status === 'preparing').length})`,
    },
    {
      key: 'ready',
      label: `Sẵn sàng (${orders.filter((o) => o.status === 'ready').length})`,
    },
    {
      key: 'delivering',
      // ✅ Count delivering orders
      label: `Đang giao (${orders.filter((o) => o.status === 'delivering').length})`,
    },
    {
      key: 'completed',
      // Count both 'completed' and 'delivered' orders as completed
      label: `Hoàn thành (${orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length})`,
    },
  ];

  const filteredOrders = filterOrders(activeTab);

  return (
    <div className="orders-page">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý đơn hàng</Title>
        <Text type="secondary">Xem và xử lý các đơn hàng từ khách hàng</Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Empty
            description={
              activeTab === 'all'
                ? 'Chưa có đơn hàng nào'
                : 'Không có đơn hàng nào trong trạng thái này'
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredOrders.map((order) => (
              <Col key={order._id} xs={24} lg={12} xl={8}>
                <OrderCard
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onConfirmHandover={handleConfirmHandover}
                  onViewDetails={handleViewDetails}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      <OrderDetailModal
        visible={modalVisible}
        order={selectedOrder}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default OrdersPage;
