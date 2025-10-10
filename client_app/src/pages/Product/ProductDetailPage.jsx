import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Row, 
  Col, 
  Card, 
  Image, 
  Typography, 
  Button, 
  InputNumber, 
  Rate, 
  Tag, 
  Divider,
  Spin,
  message
} from 'antd'
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/slices/cartSlice'
import { productAPI } from '../../api'
import './ProductDetailPage.css'

const { Title, Text, Paragraph } = Typography

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProductById(id)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      message.error('Không tìm thấy sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }))
    message.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`)
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

  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          Quay lại
        </Button>

        <Card>
          <Row gutter={[40, 40]}>
            <Col xs={24} md={10}>
              <Image
                src={product.image || '/placeholder-food.jpg'}
                alt={product.name}
                className="product-detail-image"
              />
            </Col>

            <Col xs={24} md={14}>
              <div className="product-detail-info">
                <Title level={2}>{product.name}</Title>
                
                <div className="product-rating">
                  <Rate disabled defaultValue={product.rating || 5} />
                  <Text type="secondary">({product.reviewCount || 0} đánh giá)</Text>
                </div>

                <div className="product-price-section">
                  {product.discount ? (
                    <>
                      <Text delete className="original-price">
                        {formatPrice(product.price)}
                      </Text>
                      <Title level={3} type="danger" className="discounted-price">
                        {formatPrice(product.price * (1 - product.discount / 100))}
                      </Title>
                      <Tag color="red">-{product.discount}%</Tag>
                    </>
                  ) : (
                    <Title level={3} type="danger">
                      {formatPrice(product.price)}
                    </Title>
                  )}
                </div>

                <Divider />

                <div className="product-restaurant">
                  <Text strong>Nhà hàng: </Text>
                  <Text>{product.restaurant?.name}</Text>
                </div>

                <div className="product-description">
                  <Text strong>Mô tả:</Text>
                  <Paragraph>{product.description || 'Món ăn ngon, được chế biến từ nguyên liệu tươi ngon, đảm bảo vệ sinh an toàn thực phẩm.'}</Paragraph>
                </div>

                <div className="product-quantity">
                  <Text strong>Số lượng:</Text>
                  <InputNumber
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  block
                  style={{ marginTop: 20 }}
                >
                  Thêm vào giỏ hàng - {formatPrice((product.price * (1 - (product.discount || 0) / 100)) * quantity)}
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default ProductDetailPage
