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

const OrderCard = ({ order, onUpdateStatus, onConfirmHandover, onViewDetails, onCancel }) => {
  const status = statusConfig[order.status] || statusConfig.pending;

  const getPaymentStatusText = (paymentStatus) => {
    const texts = {
      pending: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
      refund_pending: 'Đang hoàn tiền',
      refund_failed: 'Hoàn tiền thất bại',
      refunded: 'Đã hoàn tiền',
    }
    return texts[paymentStatus] || paymentStatus
  }

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      pending: 'orange',
      paid: 'green',
      failed: 'red',
      refund_pending: 'gold',
      refund_failed: 'red',
      refunded: 'cyan',
    }
    return colors[paymentStatus] || 'default'
  }

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
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  Đơn #{order._id?.slice(-6).toUpperCase()}
                </Title>
                {/* Show small payment status under id */}
                <div style={{ marginTop: 4 }}>
                  <Tag color={getPaymentStatusColor(order.paymentStatus)} style={{ marginRight: 8, fontSize: 12 }}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </Tag>
                </div>
              </div>
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

            {/* Show drone info if assigned */}
            {order.drone && (
              <Space>
                <span>🚁</span>
                <Text type="secondary" style={{ color: '#1890ff' }}>
                  Drone: {order.drone.name || order.drone.model || 'Đã phân công'}
                </Text>
              </Space>
            )}

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <Text strong>Món ăn:</Text>
              {order.items?.map((item, index) => {
                const originalUnit = item.originalPrice ?? item.product?.price ?? 0;
                const unitPrice = item.price ?? originalUnit;
                const qty = item.quantity || 0;
                const discountPercent = item.appliedPromotion?.discountPercent || 0;
                const itemDiscountAmount = (item.appliedDiscount?.amount || 0) * qty;

                return (
                  <div key={index} style={{ marginTop: 4 }}>
                    <Text>
                      {qty}x {item.product?.name || 'Sản phẩm'}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <span>Đơn giá: {unitPrice.toLocaleString('vi-VN')}₫</span>
                      <span style={{ marginLeft: 8 }}>({originalUnit.toLocaleString('vi-VN')}₫)</span>
                      {discountPercent > 0 && (
                        <span style={{ marginLeft: 8, color: '#ff4d4f' }}> -{discountPercent}%</span>
                      )}
                      {itemDiscountAmount > 0 && (
                        <span style={{ marginLeft: 8, color: '#ff4d4f' }}> Giảm {itemDiscountAmount.toLocaleString('vi-VN')}₫</span>
                      )}
                    </Text>
                  </div>
                );
              })}

              {/* Order-level voucher summary */}
              {order.appliedVoucher && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Voucher: </Text>
                  <Text strong>{order.appliedVoucher.name || order.appliedVoucher.code} - Giảm {(order.appliedVoucher.discountAmount || 0).toLocaleString('vi-VN')}₫</Text>
                </div>
              )}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <DollarOutlined />
                <Text strong style={{ fontSize: 16, color: '#667eea' }}>
                  {order.totalAmount?.toLocaleString('vi-VN')}₫
                </Text>
                {/* Show quick cancel reason snippet when cancelled */}
                {order.status === 'cancelled' && order.cancelReason && (
                  <div style={{ marginLeft: 8 }}>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      Lý do: {String(order.cancelReason).slice(0, 60)}{String(order.cancelReason).length > 60 ? '...' : ''}
                    </Text>
                  </div>
                )}
              </Space>
              
                <Space>
                <Button size="small" onClick={() => onViewDetails(order)}>
                  Chi tiết
                </Button>
                {/* Cancel button for restaurant (allow when pending or preparing) */}
                {['pending', 'preparing'].includes(order.status) && onCancel && (
                  <Button size="small" danger onClick={() => onCancel(order)}>
                    Hủy đơn
                  </Button>
                )}
                {nextStatus && (
                  <>
                    {/* Special case: ready status requires drone assignment */}
                    {order.status === 'ready' ? (
                      order.drone ? (
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => onConfirmHandover(order._id, order.drone._id || order.drone)}
                        >
                          {getNextStatusText()}
                        </Button>
                      ) : (
                        <Button 
                          size="small"
                          disabled
                          title="Chưa có drone được phân công"
                        >
                          ⚠️ Chưa có drone
                        </Button>
                      )
                    ) : (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => onUpdateStatus(order._id, nextStatus)}
                      >
                        {getNextStatusText()}
                      </Button>
                    )}
                  </>
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
