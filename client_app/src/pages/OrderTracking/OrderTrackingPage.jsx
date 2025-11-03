import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Steps, Timeline, Typography, Tag, Spin, Row, Col, Divider, Button, Modal, message, Alert } from 'antd'
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  RocketOutlined,
  HomeOutlined,
  CheckOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { orderAPI } from '../../api/orderAPI'
import socketService from '../../services/socketService'
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
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [refundInfo, setRefundInfo] = useState(null)

  useEffect(() => {
    fetchOrderTracking()
    
    // Join order tracking room - ✅ Fixed event name from 'join-order-room' to 'join-order'
    if (orderId) {
      socketService.emit('join-order', orderId)
      console.log('📡 Joined order tracking room:', orderId)
    }

    // Socket listeners for real-time updates
    socketService.on('order:status-updated', (data) => {
      console.log('🔄 Order status updated:', data)
      if (data.orderId === orderId || data._id === orderId) {
        fetchOrderTracking() // Refresh order data
      }
    })

    socketService.on('order:drone-assigned', (data) => {
      console.log('🚁 Drone assigned:', data)
      if (data.orderId === orderId) {
        fetchOrderTracking() // Refresh to show drone info
      }
    })

    socketService.on('drone:location:update', (data) => {
      console.log('📍 Drone location update:', data)
      // DroneMap component will handle this
    })

    socketService.on('delivery:complete', (data) => {
      console.log('✅ Delivery complete:', data)
      if (data.orderId === orderId) {
        message.success('🎉 Đơn hàng đã được giao đến!')
        fetchOrderTracking()
      }
    })

    // Polling as fallback (every 30 seconds)
    const interval = setInterval(fetchOrderTracking, 30000)
    
    return () => {
      clearInterval(interval)
      // Clean up socket listeners
      socketService.off('order:status-updated')
      socketService.off('order:drone-assigned')
      socketService.off('drone:location:update')
      socketService.off('delivery:complete')
    }
  }, [orderId])

  const fetchOrderTracking = async () => {
    try {
      const response = await orderAPI.trackOrder(orderId)
      console.log('🔍 Order data received:', response.data)
      console.log('📊 Order status:', response.data.status)
      console.log('⏰ Timestamps:', {
        confirmedAt: response.data.confirmedAt,
        preparingAt: response.data.preparingAt,
        deliveringAt: response.data.deliveringAt
      })
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
      'delivering': 2, // Restaurant confirm = đang giao
      'delivered': 3,
      'cancelled': -1,
    }
    return statusMap[status] || 0
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'ready': 'Sẵn sàng giao',
      'delivering': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
    }
    return texts[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'preparing': 'cyan',
      'ready': 'purple',
      'delivering': 'volcano',
      'delivered': 'green',
      'cancelled': 'red',
    }
    return colors[status] || 'default'
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
                        <Text type="secondary">
                          {new Date(order.deliveringAt).toLocaleString('vi-VN')}
                        </Text>
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
                        {order.cancelledAt && (
                          <>
                            <br />
                            <Text type="secondary">{new Date(order.cancelledAt).toLocaleString('vi-VN')}</Text>
                          </>
                        )}
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

              {/* Cancel Order Button (show when still pending) */}
              {order.status === 'pending' && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Button
                    type="default"
                    danger
                    size="large"
                    onClick={() => setCancelModalVisible(true)}
                    style={{ width: '100%', height: '44px', fontSize: '15px' }}
                  >
                    Hủy đơn hàng
                  </Button>
                </div>
              )}
            </Card>

            {/* Refund Information Card - Show if order is cancelled and has refund info */}
            {order.status === 'cancelled' && (order.refundInfo || refundInfo) && (
              <Card 
                className="tracking-card" 
                title={
                  <span>
                    <DollarOutlined /> Thông tin hoàn tiền
                  </span>
                }
              >
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

            {/* Drone Tracking Map - Show if coordinates are available */}
            {(order.restaurant?.location?.coordinates && order.deliveryInfo?.location?.coordinates) && (
              <Card className="tracking-card" title={
                <span>
                  <RocketOutlined /> {order.drone ? 'Theo dõi Drone real-time' : 'Bản đồ giao hàng'}
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
                  <Tag color={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{item.product?.name || 'Product'}</Text>
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary">Giá gốc: </Text>
                        <Text>{formatPrice(item.originalPrice || item.price)}</Text>
                        <Text style={{ marginLeft: 12 }} type="secondary">Số lượng: </Text>
                        <Text strong>{item.quantity}</Text>
                      </div>
                      {/* Show discounted unit price if different */}
                      {item.price !== item.originalPrice && (
                        <div style={{ marginTop: 6 }}>
                          <Text type="secondary">Giá sau giảm mỗi phần: </Text>
                          <Text strong>{formatPrice(item.price)}</Text>
                        </div>
                      )}

                      {/* Show per-item promotion/discount if present */}
                      {item.appliedPromotion && (
                        <div style={{ marginTop: 6 }}>
                          <Text type="secondary">Khuyến mãi: </Text>
                          <Tag color="green">{item.appliedPromotion.name} - {item.appliedPromotion.discountPercent}%</Tag>
                        </div>
                      )}
                      {item.appliedDiscount && item.appliedDiscount.amount > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <Text type="secondary">Giảm tổng cho mục này: </Text>
                          <Text type="danger">-{formatPrice(item.appliedDiscount.amount * item.quantity)}</Text>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text>{formatPrice(item.price * item.quantity)}</Text>
                    </div>
                  </div>
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
                {order.appliedVoucher && (
                  <div className="summary-row">
                    <Text>Voucher:</Text>
                    <Text strong>{order.appliedVoucher.name || order.appliedVoucher.code} - Giảm {formatPrice(order.appliedVoucher.discountAmount || 0)}</Text>
                  </div>
                )}
                {order.appliedPromotions && order.appliedPromotions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Khuyến mãi áp dụng:</Text>
                    <div style={{ marginTop: 6 }}>
                      {order.appliedPromotions.map((p) => (
                        <Tag key={p.id} color="blue">{p.name} ({p.discountPercent}%)</Tag>
                      ))}
                    </div>
                  </div>
                )}
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

        {/* Cancel Order Modal */}
        <Modal
          title="Xác nhận hủy đơn hàng"
          open={cancelModalVisible}
          onOk={async () => {
            try {
              setCanceling(true)
              const res = await orderAPI.cancelOrder(orderId)
              
              // Show refund info message if available
              if (res?.data?.refundInfo) {
                setRefundInfo(res.data.refundInfo)
                if (res.data.refundInfo.status === 'success') {
                  message.success('Đã hủy đơn hàng và yêu cầu hoàn tiền thành công!')
                } else if (res.data.refundInfo.status === 'pending') {
                  message.warning('Đã hủy đơn hàng. Yêu cầu hoàn tiền đang được xử lý.')
                } else {
                  message.success(res.data.message || 'Đã hủy đơn hàng')
                }
              } else {
                message.success('Đã hủy đơn hàng')
              }
              
              // Update order state from response or refetch
              if (res?.data?.data) setOrder(res.data.data)
              else fetchOrderTracking()
              setCancelModalVisible(false)
            } catch (error) {
              console.error('Error cancelling order:', error)
              message.error(error.response?.data?.message || 'Không thể hủy đơn hàng')
            } finally {
              setCanceling(false)
            }
          }}
          onCancel={() => setCancelModalVisible(false)}
          okText="Xác nhận hủy"
          cancelText="Đóng"
          confirmLoading={canceling}
          okButtonProps={{ danger: true, size: 'large' }}
        >
          <div style={{ padding: '20px 0' }}>
            <Text>Bạn có chắc chắn muốn hủy đơn hàng này không?</Text>
            <br /><br />
            {order?.paymentStatus === 'paid' && (
              <Alert
                message="Thông tin hoàn tiền"
                description={
                  <div>
                    <p>✅ Đơn hàng đã thanh toán sẽ được hoàn tiền tự động</p>
                    <p>💳 <strong>Phương thức:</strong> {order.paymentInfo?.method === 'vnpay' ? 'Hoàn về tài khoản VNPay/Ngân hàng' : 'Xử lý thủ công'}</p>
                    <p>⏱️ <strong>Thời gian:</strong> {order.paymentInfo?.method === 'vnpay' ? '3-7 ngày làm việc' : 'Trong vòng 24h'}</p>
                    <p>📱 Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã đăng ký để xác nhận.</p>
                  </div>
                }
                type="info"
                showIcon
                icon={<DollarOutlined />}
                style={{ marginTop: 12 }}
              />
            )}
            {order?.paymentMethod === 'COD' && (
              <Alert
                message="Đơn hàng thanh toán COD - Không có giao dịch cần hoàn"
                type="warning"
                showIcon
                style={{ marginTop: 12 }}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default OrderTrackingPage
