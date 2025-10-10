import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Empty, 
  Typography, 
  Divider,
  Row,
  Col,
  Image,
  Space,
  Popconfirm
} from 'antd'
import { 
  DeleteOutlined, 
  ShoppingOutlined,
  MinusOutlined,
  PlusOutlined 
} from '@ant-design/icons'
import { removeFromCart, updateQuantity, clearCart } from '../../redux/slices/cartSlice'
import './CartPage.css'

const { Title, Text } = Typography

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handleRemove = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Giỏ hàng trống"
            >
              <Button type="primary" onClick={() => navigate('/menu')}>
                Đi mua sắm ngay
              </Button>
            </Empty>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <Title level={2}>Giỏ hàng của bạn</Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card>
              <div className="cart-header">
                <Title level={4}>Sản phẩm ({totalItems})</Title>
                <Popconfirm
                  title="Xóa tất cả sản phẩm?"
                  description="Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?"
                  onConfirm={handleClearCart}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa tất cả
                  </Button>
                </Popconfirm>
              </div>

              <List
                dataSource={items}
                renderItem={(item) => (
                  <List.Item className="cart-item">
                    <div className="cart-item-content">
                      <Image
                        src={item.image || '/placeholder-food.jpg'}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="cart-item-image"
                      />
                      
                      <div className="cart-item-info">
                        <div>
                          <Text strong className="cart-item-name">
                            {item.name}
                          </Text>
                          <div>
                            <Text type="secondary" className="cart-item-restaurant">
                              {item.restaurant?.name}
                            </Text>
                          </div>
                          <Text type="danger" strong className="cart-item-price">
                            {formatPrice(item.price)}
                          </Text>
                        </div>

                        <Space className="cart-item-actions">
                          <Button
                            icon={<MinusOutlined />}
                            size="small"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          />
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(value) => handleQuantityChange(item._id, value)}
                            className="quantity-input"
                          />
                          <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          />
                          <Popconfirm
                            title="Xóa sản phẩm?"
                            onConfirm={() => handleRemove(item._id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="cart-summary" title="Tóm tắt đơn hàng">
              <div className="summary-row">
                <Text>Tạm tính ({totalItems} món):</Text>
                <Text strong>{formatPrice(totalPrice)}</Text>
              </div>
              <div className="summary-row">
                <Text>Phí giao hàng:</Text>
                <Text strong>{formatPrice(15000)}</Text>
              </div>
              <Divider />
              <div className="summary-row summary-total">
                <Title level={4}>Tổng cộng:</Title>
                <Title level={4} type="danger">
                  {formatPrice(totalPrice + 15000)}
                </Title>
              </div>
              
              <Button
                type="primary"
                size="large"
                block
                icon={<ShoppingOutlined />}
                onClick={handleCheckout}
                className="checkout-btn"
              >
                Tiến hành đặt hàng
              </Button>

              <Button
                block
                onClick={() => navigate('/menu')}
                style={{ marginTop: 12 }}
              >
                Tiếp tục mua hàng
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CartPage
