import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Timeline, Typography, Tag, Spin, Row, Col, Divider, Button, Modal, message, Alert } from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  HomeOutlined,
  CheckOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  FrownOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import { orderAPI } from '../../api/orderAPI';
import socketService from '../../services/socketService';
import DroneMap from './DroneMap';
import './OrderTrackingPage.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [refundInfo, setRefundInfo] = useState(null);

  useEffect(() => {
    fetchOrderTracking();

    if (orderId) {
      socketService.emit('join-order', orderId);
    }

    const handleOrderStatusUpdate = (data) => {
      if (data.orderId === orderId || data._id === orderId) {
        fetchOrderTracking();
      }
    };

    const handleDroneAssigned = (data) => {
      if (data.orderId === orderId) {
        fetchOrderTracking();
      }
    };

    const handleDeliveryComplete = (data) => {
      if (data.orderId === orderId) {
        message.success('🎉 Đơn hàng đã được giao đến!');
        fetchOrderTracking();
      }
    };

    socketService.on('order:status-updated', handleOrderStatusUpdate);
    socketService.on('order:drone-assigned', handleDroneAssigned);
    socketService.on('delivery:complete', handleDeliveryComplete);

    const interval = setInterval(fetchOrderTracking, 30000);

    return () => {
      clearInterval(interval);
      socketService.off('order:status-updated', handleOrderStatusUpdate);
      socketService.off('order:drone-assigned', handleDroneAssigned);
      socketService.off('delivery:complete', handleDeliveryComplete);
    };
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      const response = await orderAPI.trackOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrder(null); // Set order to null on error to show 'not found' message
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      setConfirming(true);
      const response = await orderAPI.confirmDelivery(orderId);
      message.success('Đã xác nhận nhận hàng thành công!');
      setOrder(response.data.data);
      setConfirmModalVisible(false);
      fetchOrderTracking();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      message.error(error.response?.data?.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setConfirming(false);
    }
  };
  
  const handleCancelOrder = async () => {
    try {
      setCanceling(true);
      const res = await orderAPI.cancelOrder(orderId);
      
      if (res?.data?.refundInfo) {
        setRefundInfo(res.data.refundInfo);
        if (res.data.refundInfo.status === 'success') {
          message.success('Đã hủy đơn hàng và yêu cầu hoàn tiền thành công!');
        } else if (res.data.refundInfo.status === 'pending') {
          message.warning('Đã hủy đơn hàng. Yêu cầu hoàn tiền đang được xử lý.');
        } else {
          message.success(res.data.message || 'Đã hủy đơn hàng');
        }
      } else {
        message.success('Đã hủy đơn hàng');
      }
      
      if (res?.data?.data) setOrder(res.data.data);
      else fetchOrderTracking();
      
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusStep = (status) => {
    const statusMap = {
      'pending': 0,
      'confirmed': 1,
      'preparing': 1,
      'ready': 2,
      'delivering': 2,
      'delivered': 3,
      'cancelled': -1,
    };
    return statusMap[status] ?? 0;
  };

  const getStatusInfo = (status) => {
    const info = {
      'pending': { text: 'Chờ xác nhận', color: 'orange', icon: <FieldTimeOutlined /> },
      'confirmed': { text: 'Đã xác nhận', color: 'blue', icon: <CheckCircleOutlined /> },
      'preparing': { text: 'Đang chuẩn bị', color: 'cyan', icon: <CheckCircleOutlined /> },
      'ready': { text: 'Sẵn sàng giao', color: 'purple', icon: <RocketOutlined /> },
      'delivering': { text: 'Đang giao', color: 'volcano', icon: <RocketOutlined /> },
      'delivered': { text: 'Đã giao', color: 'green', icon: <HomeOutlined /> },
      'cancelled': { text: 'Đã hủy', color: 'red', icon: <FrownOutlined /> },
    };
    return info[status] || { text: status, color: 'default', icon: <InfoCircleOutlined /> };
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return (
      <div className="loading-container-re">
        <Spin size="large" />
        <Title level={4}>Đang tải dữ liệu đơn hàng...</Title>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="not-found-container-re">
        <FrownOutlined style={{ fontSize: 64, color: '#ccc' }} />
        <Title level={3}>Không tìm thấy đơn hàng</Title>
        <Paragraph type="secondary">Mã đơn hàng không hợp lệ hoặc đã có lỗi xảy ra.</Paragraph>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const statusInfo = getStatusInfo(order.status);

  const timelineItems = [
    {
      color: 'green',
      children: (
        <>
          <Text strong>Đơn hàng đã được đặt</Text>
          <br />
          <Text type="secondary">{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
        </>
      )
    },
    ...(order.confirmedAt ? [{
      color: 'blue',
      children: (
        <>
          <Text strong>Nhà hàng đã xác nhận</Text>
          <br />
          <Text type="secondary">{new Date(order.confirmedAt).toLocaleString('vi-VN')}</Text>
        </>
      )
    }] : []),
    ...(order.preparingAt ? [{
      color: 'orange',
      children: (
        <>
          <Text strong>Đang chuẩn bị món ăn</Text>
          <br />
          <Text type="secondary">{new Date(order.preparingAt).toLocaleString('vi-VN')}</Text>
        </>
      )
    }] : []),
    ...(order.deliveringAt ? [{
      color: 'purple',
      children: (
        <>
          <Text strong>Drone đang giao hàng 🚁</Text>
          <br />
          <Text type="secondary">{new Date(order.deliveringAt).toLocaleString('vi-VN')}</Text>
        </>
      )
    }] : []),
    ...(order.deliveredAt ? [{
      color: 'green',
      children: (
        <>
          <Text strong>Đã giao hàng thành công</Text>
          <br />
          <Text type="secondary">{new Date(order.deliveredAt).toLocaleString('vi-VN')}</Text>
        </>
      )
    }] : []),
    ...(order.status === 'cancelled' ? [{
      color: 'red',
      children: (
        <>
          <Text strong>Đơn hàng đã bị hủy</Text>
          {order.cancelReason && <><br /><Text type="secondary">{order.cancelReason}</Text></>}
          {order.cancelledAt && <><br /><Text type="secondary">{new Date(order.cancelledAt).toLocaleString('vi-VN')}</Text></>}
        </>
      )
    }] : []),
  ];

  return (
    <div className="order-tracking-page-re">
      <div className="container-re">
        <div className="tracking-header-re">
          <Title level={2} style={{ marginBottom: 0 }}>
            Đơn hàng #{order.orderNumber || orderId}
          </Title>
          <Tag icon={statusInfo.icon} color={statusInfo.color} style={{ fontSize: 16, padding: '8px 16px', borderRadius: 8 }}>
            {statusInfo.text}
          </Tag>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="tracking-card-re">
              <Title level={4} style={{ marginTop: 0 }}>Trạng thái đơn hàng</Title>
              <Steps current={currentStep} status={order.status === 'cancelled' ? 'error' : 'process'} className="tracking-steps-re">
                <Step title="Đặt hàng" icon={<ShoppingCartOutlined />} description="Đã nhận yêu cầu" />
                <Step title="Chuẩn bị" icon={<CheckCircleOutlined />} description="Nhà hàng đang chuẩn bị" />
                <Step title="Đang giao" icon={<RocketOutlined />} description="Drone đang trên đường" />
                <Step title="Hoàn thành" icon={<HomeOutlined />} description="Đã giao đến bạn" />
              </Steps>
            </Card>

            <Card className="tracking-card-re">
              <Title level={4} style={{ marginTop: 0 }}>Lịch sử cập nhật</Title>
              <Timeline mode="left" items={timelineItems} className="tracking-timeline-re" />
              
              <div className="action-buttons-re">
                {order.status === 'delivering' && (
                  <Button type="primary" size="large" icon={<CheckOutlined />} onClick={() => setConfirmModalVisible(true)}>
                    Tôi đã nhận được hàng
                  </Button>
                )}
                {order.status === 'pending' && (
                  <Button danger size="large" onClick={() => setCancelModalVisible(true)}>
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </Card>

            {order.status === 'cancelled' && (order.refundInfo || refundInfo) && (
              <Card className="tracking-card-re" title={<span><DollarOutlined /> Thông tin hoàn tiền</span>}>
                {(order.refundInfo || refundInfo)?.status === 'success' && (
                  <Alert
                    message="Hoàn tiền thành công"
                    description={
                      <div>
                        <p><strong>Số tiền:</strong> {formatPrice((order.refundInfo || refundInfo).amount || 0)}</p>
                        <p><strong>Phương thức:</strong> {(order.refundInfo || refundInfo).method === 'vnpay' ? 'VNPay' : 'Thủ công'}</p>
                        <p><strong>Thời gian hoàn:</strong> {(order.refundInfo || refundInfo).estimatedTime || 'Đang xử lý'}</p>
                        <p style={{ marginTop: 12 }}>{(order.refundInfo || refundInfo).message}</p>
                      </div>
                    }
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                  />
                )}

                {(order.refundInfo || refundInfo)?.status === 'pending' && (
                  <Alert
                    message="Yêu cầu hoàn tiền đang được xử lý"
                    description={
                      <div>
                        <p><strong>Số tiền:</strong> {formatPrice((order.refundInfo || refundInfo).amount || 0)}</p>
                        <p><strong>Phương thức:</strong> {(order.refundInfo || refundInfo).method === 'manual' ? 'Xử lý thủ công' : 'Tự động'}</p>
                        <p style={{ marginTop: 12 }}>{(order.refundInfo || refundInfo).message}</p>
                        <p style={{ marginTop: 12 }}>
                          <InfoCircleOutlined /> <em>Bộ phận chăm sóc khách hàng sẽ liên hệ với bạn trong thời gian sớm nhất.</em>
                        </p>
                      </div>
                    }
                    type="info"
                    showIcon
                    icon={<ClockCircleOutlined />}
                  />
                )}

                {(order.refundInfo || refundInfo)?.status === 'not_applicable' && (
                  <Alert
                    message="Không có giao dịch cần hoàn"
                    description={(order.refundInfo || refundInfo).message}
                    type="warning"
                    showIcon
                  />
                )}
              </Card>
            )}

            {(order.restaurant?.location?.coordinates && order.deliveryInfo?.location?.coordinates) && (
              <Card className="tracking-card-re" title={<span><RocketOutlined /> {order.drone ? 'Theo dõi Drone real-time' : 'Bản đồ giao hàng'}</span>}>
                <DroneMap order={order} />
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card className="tracking-card-re order-details-card-re" title="Thông tin giao hàng">
              <div className="info-row-re"><Text type="secondary">Người nhận:</Text><Text strong>{order.deliveryInfo?.name || 'N/A'}</Text></div>
              <div className="info-row-re"><Text type="secondary">Số điện thoại:</Text><Text strong>{order.deliveryInfo?.phone || 'N/A'}</Text></div>
              <div className="info-row-re"><Text type="secondary">Địa chỉ:</Text><Text strong>{order.deliveryInfo?.address || 'N/A'}</Text></div>
              {order.distanceKm != null && <div className="info-row-re"><Text type="secondary">Khoảng cách:</Text><Text strong>{order.distanceKm} km</Text></div>}
            </Card>

            <Card className="tracking-card-re" title="Sản phẩm đã đặt">
              {order.items?.map((item, index) => (
                <div key={index} className="product-item-re">
                  <div className="product-image-re">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <InboxOutlined />
                    )}
                  </div>
                  <div className="product-info-re">
                    <Paragraph strong className="product-name-re" ellipsis={{ rows: 1 }}>{item.product?.name || 'Sản phẩm'}</Paragraph>
                    <Text className="product-meta-re">SL: {item.quantity} x {formatPrice(item.price)}</Text>
                  </div>
                  <div className="product-price-re">
                    <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                  </div>
                </div>
              ))}
            </Card>

            <Card className="tracking-card-re" title="Tóm tắt đơn hàng">
              <div className="summary-row-re"><Text>Tạm tính:</Text><Text>{formatPrice(order.subtotal || 0)}</Text></div>
              <div className="summary-row-re"><Text>Phí giao hàng:</Text><Text>{formatPrice(order.deliveryFee || 0)}</Text></div>
              {order.appliedVoucher && (
                <div className="summary-row-re">
                  <Text>Voucher giảm:</Text>
                  <Text type="danger">-{formatPrice(order.appliedVoucher.discountAmount || 0)}</Text>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <div className="total-row-re">
                <Title level={4}>Tổng cộng:</Title>
                <Title level={4} type="danger">{formatPrice(order.totalAmount || 0)}</Title>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Modals */}
        <Modal
          title="Xác nhận đã nhận hàng"
          open={confirmModalVisible}
          onOk={handleConfirmDelivery}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={confirming}
        >
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={5}>Bạn có chắc chắn đã nhận được hàng không?</Title>
            <Paragraph type="secondary">Hành động này sẽ hoàn tất đơn hàng.</Paragraph>
          </div>
        </Modal>

        <Modal
          title="Xác nhận hủy đơn hàng"
          open={cancelModalVisible}
          onOk={handleCancelOrder}
          onCancel={() => setCancelModalVisible(false)}
          okText="Xác nhận hủy"
          cancelText="Đóng"
          confirmLoading={canceling}
          okButtonProps={{ danger: true }}
        >
          <div style={{ padding: '20px 0' }}>
            <Title level={5}>Bạn có chắc chắn muốn hủy đơn hàng này không?</Title>
            {order?.paymentStatus === 'paid' && (
              <Alert
                message="Thông tin hoàn tiền"
                description={
                  <>
                    <p>✅ Đơn hàng đã thanh toán sẽ được hoàn tiền tự động.</p>
                    <p>💳 <strong>Phương thức:</strong> {order.paymentInfo?.method === 'vnpay' ? 'Hoàn về tài khoản VNPay/Ngân hàng' : 'Xử lý thủ công'}</p>
                    <p>⏱️ <strong>Thời gian:</strong> {order.paymentInfo?.method === 'vnpay' ? '3-7 ngày làm việc' : 'Trong vòng 24h'}</p>
                  </>
                }
                type="info"
                showIcon
                icon={<DollarOutlined />}
                style={{ marginTop: 20 }}
              />
            )}
            {order?.paymentMethod === 'COD' && (
              <Alert message="Đơn hàng COD sẽ được hủy mà không cần hoàn tiền." type="warning" showIcon style={{ marginTop: 20 }} />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

