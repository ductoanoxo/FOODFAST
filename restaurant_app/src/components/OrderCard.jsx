import { Card, Tag, Typography, Space, Button, Divider } from 'antd';
import { ClockCircleOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './OrderCard.css';

const { Text, Title } = Typography;

const statusConfig = {
  pending: { color: 'orange', text: 'Chờ xác nhận' },
  preparing: { color: 'blue', text: 'Đang chuẩn bị' },
  ready: { color: 'cyan', text: 'Sẵn sàng giao' },
  delivering: { color: 'purple', text: 'Đang giao' },
  completed: { color: 'green', text: 'Hoàn thành' },
  delivered: { color: 'green', text: 'Hoàn thành' },
  cancelled: { color: 'red', text: 'Đã hủy' },
};

const OrderCard = ({ order, onUpdateStatus, onViewDetails }) => {
  const status = statusConfig[order.status] || statusConfig.pending;

  const getNextStatus = () => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'delivering',
    };
    return statusFlow[order.status];
  };

  const getNextStatusText = () => {
    const textMap = {
      pending: 'Xác nhận đơn',
      preparing: 'Sẵn sàng',
      ready: 'Giao hàng',
    };
    return textMap[order.status];
  };

  const nextStatus = getNextStatus();

  return (
    <Card 
      className="order-card"
      hoverable
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>
                Đơn #{order._id?.slice(-6).toUpperCase()}
              </Title>
              <Tag color={status.color}>{status.text}</Tag>
            </div>

            <Space>
              <UserOutlined />
              <Text>{order.user?.name || 'Khách hàng'}</Text>
            </Space>

            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">
                {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </Space>

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <Text strong>Món ăn:</Text>
              {order.items?.map((item, index) => (
                <div key={index} style={{ marginTop: 4 }}>
                  <Text>
                    {item.quantity}x {item.product?.name || 'Sản phẩm'} 
                    <Text type="secondary"> - {item.price?.toLocaleString('vi-VN')}₫</Text>
                  </Text>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <DollarOutlined />
                <Text strong style={{ fontSize: 16, color: '#667eea' }}>
                  {order.totalAmount?.toLocaleString('vi-VN')}₫
                </Text>
              </Space>
              
              <Space>
                <Button size="small" onClick={() => onViewDetails(order)}>
                  Chi tiết
                </Button>
                {nextStatus && (
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => onUpdateStatus(order._id, nextStatus)}
                  >
                    {getNextStatusText()}
                  </Button>
                )}
              </Space>
            </div>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;
