import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  List,
  message,
  Modal,
} from 'antd'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  CreditCardOutlined,
  WalletOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { orderAPI } from '../../api/orderAPI'
import { paymentAPI } from '../../api/paymentAPI'
import { restaurantAPI } from '../../api/restaurantAPI'
import { clearCart } from '../../redux/slices/cartSlice'
import VoucherSelector from '../../components/VoucherSelector/VoucherSelector'
import DroneMap from '../OrderTracking/DroneMap'
import './CheckoutPage.css'

const { Title, Text } = Typography
const { TextArea } = Input

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isCalculatingFee, setIsCalculatingFee] = useState(false)
  const [distance, setDistance] = useState(null)
  const [estimatedDuration, setEstimatedDuration] = useState(null)
  const [routingMethod, setRoutingMethod] = useState(null)
  const [feeCalculated, setFeeCalculated] = useState(false)
  const [mapModalVisible, setMapModalVisible] = useState(false)
  const [mapData, setMapData] = useState(null)

  const { items, totalPrice } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const [restaurantClosed, setRestaurantClosed] = useState(false)
  const [restaurantLoading, setRestaurantLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState(null)
  const [appliedVoucherData, setAppliedVoucherData] = useState(null)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const discountAmount = appliedVoucherData?.discountAmount || 0
  const totalAmount = totalPrice + deliveryFee - discountAmount

  const handleCalculateFee = async () => {
    const address = form.getFieldValue('address')
    if (!address) {
      message.error('Vui lòng nhập địa chỉ giao hàng trước.')
      return
    }
    if (!restaurantId) {
      message.error('Không tìm thấy nhà hàng từ giỏ hàng.')
      return
    }

    setIsCalculatingFee(true)
    try {
      const response = await orderAPI.calculateDeliveryFee({
        restaurantId: restaurantId,
        userAddress: address,
      })

      const responseData = response.data || response

      if (responseData && responseData.deliveryFee !== undefined) {
        setDeliveryFee(responseData.deliveryFee)
        setDistance(responseData.distance)
        setEstimatedDuration(responseData.estimatedDuration)
        setRoutingMethod(responseData.routingMethod)
        setFeeCalculated(true)
        
        // Message hiển thị phương thức tính khoảng cách
        let methodText = ''
        if (responseData.routingMethod === 'routing') {
          methodText = '(đường đi thực tế qua OSRM)'
        } else if (responseData.routingMethod === 'haversine_adjusted') {
          methodText = '(ước tính với hệ số điều chỉnh)'
        } else {
          methodText = '(ước tính)'
        }
        
        message.success(
          `Đã tính phí giao hàng: ${responseData.distance} km ${methodText}. ` +
          `Thời gian dự kiến: ~${responseData.estimatedDuration} phút.`
        )

        setMapData({
          restaurant: {
            name: items[0]?.restaurant?.name || 'Nhà hàng',
            location: responseData.restaurantLocation,
          },
          deliveryInfo: {
            address: form.getFieldValue('address'),
            location: responseData.userLocation,
          },
          routeGeometry: responseData.routeGeometry, // Thêm route geometry từ OSRM
          routingMethod: responseData.routingMethod,
        })
      } else {
        console.error('Unexpected API response structure:', response)
        throw new Error('Không nhận được dữ liệu phí giao hàng từ server.')
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error)
      message.error(error.response?.data?.message || 'Không thể tính phí giao hàng.')
      setFeeCalculated(false)
    } finally {
      setIsCalculatingFee(false)
    }
  }

  const handleApplyVoucher = (voucherData) => {
    setAppliedVoucherData(voucherData)
  }

  const onFinish = async (values) => {
    if (restaurantClosed) {
      message.error('Nhà hàng hiện đang đóng cửa, không thể đặt hàng.')
      return
    }
    if (!feeCalculated) {
      message.warn('Vui lòng bấm nút "Tính phí giao hàng" trước khi đặt hàng.')
      return
    }
    try {
      setLoading(true)

      const token = localStorage.getItem('token')
      if (!token || !user) {
        message.error('Bạn cần đăng nhập để đặt hàng!')
        navigate('/login', { state: { from: '/checkout' } })
        return
      }

      const orderData = {
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryInfo: {
          name: values.name,
          phone: values.phone,
          address: values.address,
        },
        note: values.note || '',
        paymentMethod,
        voucherCode: appliedVoucherData?.voucher?.code || undefined,
        clientCalculatedTotal: totalAmount,
        clientDiscount: discountAmount,
      }

      const response = await orderAPI.createOrder(orderData)
      const orderId = response?.data?.data?._id || response?.data?._id || response?.data

      if (paymentMethod === 'VNPAY') {
        try {
          const paymentResponse = await paymentAPI.createVNPayPayment({
            orderId: orderId,
            amount: totalAmount,
            orderInfo: `Thanh toan don hang #${orderId}`,
          })
          localStorage.setItem('pendingOrderId', orderId)
          window.location.href = paymentResponse.data.paymentUrl
        } catch (paymentError) {
          console.error('VNPay payment error:', paymentError)
          message.error('Không thể tạo thanh toán VNPay!')
          dispatch(clearCart())
          navigate(`/order-tracking/${orderId}`)
        }
      } else {
        dispatch(clearCart())
        message.success('Đặt hàng thành công!')
        navigate(`/order-tracking/${orderId}`)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      message.error(error.response?.data?.message || 'Đặt hàng thất bại!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setRestaurantLoading(true)
        if (!items || items.length === 0) {
          setRestaurantId(null)
          setRestaurantClosed(false)
          setRestaurantLoading(false)
          return
        }

        const first = items[0]
        const resId = first?.restaurant?._id || first?.restaurant
        setRestaurantId(resId)
        if (!resId) {
          setRestaurantClosed(false)
          return
        }
        const resp = await restaurantAPI.getRestaurantById(resId)
        const data = resp.data?.data || resp.data
        const isOpen = data?.isOpen
        setRestaurantClosed(isOpen === false)
      } catch (e) {
        console.error('Failed to load restaurant status', e)
      } finally {
        setRestaurantLoading(false)
      }
    }
    loadStatus()
  }, [items])

  return (
    <div className="checkout-page">
      <div className="container">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={15}>
            <Title level={2} style={{ marginBottom: 24 }}>
              Thanh toán
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: user?.name || '',
                phone: user?.phone || '',
                address: user?.address || '',
              }}
            >
              <Card title="1. Thông tin giao hàng" className="checkout-card">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="address"
                  label="Địa chỉ giao hàng"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <TextArea placeholder="Nhập địa chỉ chi tiết" rows={3} size="large" />
                </Form.Item>

                <div className="fee-calculator-panel">
                  <div className="fee-actions">
                    <Button
                      className="calc-fee-btn"
                      onClick={handleCalculateFee}
                      loading={isCalculatingFee}
                      disabled={restaurantLoading}
                      icon={<EnvironmentOutlined />}
                    >
                      <span>Tính phí giao hàng</span>
                    </Button>
                    {feeCalculated && (
                      <Button
                        className="view-map-btn"
                        onClick={() => setMapModalVisible(true)}
                        icon={<GlobalOutlined />}
                      >
                        Xem bản đồ
                      </Button>
                    )}
                  </div>

                  {feeCalculated && distance && (
                    <div className="distance-highlight">
                      <EnvironmentOutlined />
                      <Text>Khoảng cách: </Text>
                      <Text strong>~{distance} km</Text>
                      {estimatedDuration && (
                        <>
                          <Text style={{ margin: '0 8px' }}>•</Text>
                          <Text>Thời gian: </Text>
                          <Text strong>~{estimatedDuration} phút</Text>
                        </>
                      )}
                      {routingMethod === 'routing' && (
                        <Text type="success" style={{ marginLeft: 8, fontSize: '12px' }}>
                          ✓ Đường đi thực tế
                        </Text>
                      )}
                    </div>
                  )}
                </div>

                <Form.Item name="note" label="Ghi chú (không bắt buộc)" style={{ marginTop: 24 }}>
                  <TextArea placeholder="Ghi chú cho người giao hàng..." rows={2} />
                </Form.Item>
              </Card>

              <Card title="2. Phương thức thanh toán" className="checkout-card">
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%' }}
                  className="payment-radio-group"
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div
                      className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <WalletOutlined style={{ fontSize: 28, color: '#52c41a' }} />
                      <div>
                        <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </Text>
                      </div>
                    </div>

                    <div
                      className={`payment-option-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('VNPAY')}
                    >
                      <CreditCardOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                      <div>
                        <Text strong>VNPay</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Thanh toán qua cổng VNPay (Thẻ ATM, Visa, QR Pay)
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Radio.Group>
              </Card>

              {restaurantId && (
                <Card title="3. Mã khuyến mãi" className="checkout-card">
                  <VoucherSelector
                    restaurantId={restaurantId}
                    orderTotal={totalPrice}
                    onApply={handleApplyVoucher}
                    appliedVoucher={appliedVoucherData}
                  />
                </Card>
              )}
            </Form>
          </Col>

          <Col xs={24} lg={9}>
            <Card title="Tóm tắt đơn hàng" className="order-summary-card">
              <List
                dataSource={items}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.name}</Text>}
                      description={`${item.quantity} x ${formatPrice(item.price)}`}
                    />
                    <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                  </List.Item>
                )}
              />

              <Divider style={{ margin: '16px 0' }} />

              <div className="summary-row">
                <Text>Tạm tính:</Text>
                <Text strong>{formatPrice(totalPrice)}</Text>
              </div>
              <div className="summary-row">
                <Text>Phí giao hàng:</Text>
                <Text strong>
                  {feeCalculated ? formatPrice(deliveryFee) : <span style={{ color: '#888' }}>Tính sau</span>}
                </Text>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row">
                  <Text>Giảm giá voucher:</Text>
                  <Text strong type="success">
                    -{formatPrice(discountAmount)}
                  </Text>
                </div>
              )}

              <div className="total-section">
                <div className="summary-row">
                  <Title level={4}>Tổng cộng:</Title>
                  <Title level={4} type="danger">
                    {formatPrice(totalAmount)}
                  </Title>
                </div>
                {restaurantClosed && (
                  <div style={{ marginBottom: 12, textAlign: 'center' }}>
                    <Text type="danger">Nhà hàng hiện đang đóng cửa.</Text>
                  </div>
                )}
                <Button
                  className="place-order-btn"
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  disabled={restaurantClosed || restaurantLoading}
                  onClick={() => form.submit()}
                >
                  ĐẶT HÀNG
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Xem trước lộ trình giao hàng"
          open={mapModalVisible}
          onCancel={() => setMapModalVisible(false)}
          footer={null}
          width={800}
        >
          {mapData && <DroneMap order={mapData} />}
        </Modal>
      </div>
    </div>
  )
}

export default CheckoutPage
