import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Steps, Timeline, Typography, Tag, Spin, Row, Col, Divider, Button, Modal, message } from 'antd'
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  RocketOutlined,
  HomeOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { orderAPI } from '../../api/orderAPI'
import DroneMap from './DroneMap'
import './OrderTrackingPage.css'

const { Title, Text } = Typography
const { Step } = Steps

const OrderTrackingPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchOrderTracking()
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrderTracking, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [orderId])

  const fetchOrderTracking = async () => {
    try {
      const response = await orderAPI.trackOrder(orderId)
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelivery = async () => {
    try {
      setConfirming(true)
      const response = await orderAPI.confirmDelivery(orderId)
      message.success('Đã xác nhận nhận hàng thành công!')
      setOrder(response.data.data)
      setConfirmModalVisible(false)
      // Refresh order data
      fetchOrderTracking()
    } catch (error) {
      console.error('Error confirming delivery:', error)
      message.error(error.response?.data?.message || 'Không thể xác nhận nhận hàng')
    } finally {
      setConfirming(false)
    }
  }

  const getStatusStep = (status) => {
    const statusMap = {
      'pending': 0,
      'confirmed': 1,
      'preparing': 1,
      'ready': 2,
      'delivering': 2,
      'delivered': 3,
      'cancelled': -1,
    }
    return statusMap[status] || 0
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>
  }

  const currentStep = getStatusStep(order.status)

  return (
    <div className="order-tracking-page">
      <div className="container">
        <Title level={2}>Theo dõi đơn hàng #{order.orderNumber || orderId}</Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Order Status */}
            <Card className="tracking-card">
              <Title level={4}>Trạng thái đơn hàng</Title>
              <Steps current={currentStep} status={order.status === 'cancelled' ? 'error' : 'process'}>
                <Step title="Đã đặt hàng" icon={<ShoppingCartOutlined />} />
                <Step title="Đang chuẩn bị" icon={<CheckCircleOutlined />} />
                <Step title="Đang giao" icon={<RocketOutlined />} />
                <Step title="Đã giao" icon={<HomeOutlined />} />
              </Steps>

              <Divider />

              <Timeline 
                mode="left" 
                style={{ marginTop: 32 }}
                items={[
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
                        <br />
                        <Text type="secondary">{order.cancelReason}</Text>
                      </>
                    )
                  }] : []),
                ]}
              />

              {/* Confirm Delivery Button */}
              {order.status === 'delivering' && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<CheckOutlined />}
                    onClick={() => setConfirmModalVisible(true)}
                    style={{ width: '100%', height: '50px', fontSize: '16px' }}
                  >
                    ✅ Tôi đã nhận được hàng
                  </Button>
                </div>
              )}
            </Card>

            {/* Drone Tracking Map */}
            {order.drone && (order.status === 'delivering' || order.status === 'delivered') && (
              <Card className="tracking-card" title={
                <span>
                  <RocketOutlined /> Theo dõi Drone real-time
                </span>
              }>
                <DroneMap order={order} />
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            {/* Order Details */}
            <Card title="Chi tiết đơn hàng">
              <div className="order-info">
                <div className="info-row">
                  <Text type="secondary">Mã đơn hàng:</Text>
                  <Text strong>#{order.orderNumber || orderId}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Trạng thái:</Text>
                  <Tag color={order.status === 'delivered' ? 'green' : 'orange'}>
                    {order.status}
                  </Tag>
                </div>
                <div className="info-row">
                  <Text type="secondary">Người nhận:</Text>
                  <Text>{order.deliveryInfo?.name || 'N/A'}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Số điện thoại:</Text>
                  <Text>{order.deliveryInfo?.phone || 'N/A'}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Địa chỉ:</Text>
                  <Text>{order.deliveryInfo?.address || 'N/A'}</Text>
                </div>
              </div>

              <Divider />

              <Title level={5}>Món ăn</Title>
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <Text>{item.quantity}x {item.product?.name || 'Product'}</Text>
                  <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                </div>
              ))}

              <Divider />

              <div className="order-summary">
                <div className="summary-row">
                  <Text>Tạm tính:</Text>
                  <Text>{formatPrice(order.subtotal || 0)}</Text>
                </div>
                <div className="summary-row">
                  <Text>Phí giao hàng:</Text>
                  <Text>{formatPrice(order.deliveryFee || 0)}</Text>
                </div>
                <Divider />
                <div className="summary-row">
                  <Title level={4}>Tổng cộng:</Title>
                  <Title level={4} type="danger">
                    {formatPrice(order.totalAmount || 0)}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Confirmation Modal */}
        <Modal
          title="Xác nhận đã nhận hàng"
          open={confirmModalVisible}
          onOk={handleConfirmDelivery}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={confirming}
          okButtonProps={{ 
            type: 'primary',
            danger: false,
            size: 'large'
          }}
        >
          <div style={{ padding: '20px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', display: 'block', textAlign: 'center', marginBottom: 16 }} />
            <p style={{ fontSize: 16, textAlign: 'center' }}>
              Bạn có chắc chắn đã nhận được hàng không?
            </p>
            <p style={{ textAlign: 'center', color: '#888' }}>
              Sau khi xác nhận, đơn hàng sẽ được đánh dấu là đã hoàn thành và drone sẽ sẵn sàng cho chuyến giao tiếp theo.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default OrderTrackingPage
