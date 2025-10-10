import { useState } from 'react'
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
} from 'antd'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { orderAPI } from '../../api/orderAPI'
import { clearCart } from '../../redux/slices/cartSlice'
import './CheckoutPage.css'

const { Title, Text } = Typography
const { TextArea } = Input

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  
  const { items, totalPrice } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const deliveryFee = 15000
  const totalAmount = totalPrice + deliveryFee

  const onFinish = async (values) => {
    try {
      setLoading(true)
      const orderData = {
        ...values,
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        totalAmount,
        deliveryFee,
      }

      const response = await orderAPI.createOrder(orderData)
      
      dispatch(clearCart())
      message.success('Đặt hàng thành công!')
      navigate(`/order-tracking/${response.data._id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      message.error(error.message || 'Đặt hàng thất bại!')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <Title level={2}>Thanh toán</Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
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
              {/* Thông tin giao hàng */}
              <Card title="Thông tin giao hàng" className="checkout-card">
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" size="large" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" size="large" />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Địa chỉ giao hàng"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <TextArea
                    prefix={<EnvironmentOutlined />}
                    placeholder="Nhập địa chỉ chi tiết"
                    rows={3}
                    size="large"
                  />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú (không bắt buộc)">
                  <TextArea placeholder="Ghi chú cho người giao hàng..." rows={2} />
                </Form.Item>
              </Card>

              {/* Phương thức thanh toán */}
              <Card title="Phương thức thanh toán" className="checkout-card">
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="COD" className="payment-radio">
                      <div className="payment-option">
                        <WalletOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                        <div>
                          <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Thanh toán bằng tiền mặt khi nhận hàng
                          </Text>
                        </div>
                      </div>
                    </Radio>

                    <Radio value="VNPAY" className="payment-radio">
                      <div className="payment-option">
                        <CreditCardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <div>
                          <Text strong>VNPay</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Thanh toán qua VNPay
                          </Text>
                        </div>
                      </div>
                    </Radio>

                    <Radio value="MOMO" className="payment-radio">
                      <div className="payment-option">
                        <CreditCardOutlined style={{ fontSize: 24, color: '#d71f85' }} />
                        <div>
                          <Text strong>Momo</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Thanh toán qua ví Momo
                          </Text>
                        </div>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Card>

              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Đặt hàng
              </Button>
            </Form>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Đơn hàng" className="order-summary">
              <List
                dataSource={items}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={`${item.quantity} x ${formatPrice(item.price)}`}
                    />
                    <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                  </List.Item>
                )}
              />

              <Divider />

              <div className="summary-row">
                <Text>Tạm tính:</Text>
                <Text strong>{formatPrice(totalPrice)}</Text>
              </div>
              <div className="summary-row">
                <Text>Phí giao hàng:</Text>
                <Text strong>{formatPrice(deliveryFee)}</Text>
              </div>
              <Divider />
              <div className="summary-row summary-total">
                <Title level={4}>Tổng cộng:</Title>
                <Title level={4} type="danger">
                  {formatPrice(totalAmount)}
                </Title>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CheckoutPage
