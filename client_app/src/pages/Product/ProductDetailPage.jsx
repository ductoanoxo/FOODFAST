import { useEffect, useState, useCallback } from 'react'
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
import { ShoppingCartOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/slices/cartSlice'
import { productAPI } from '../../api'
import { restaurantAPI } from '../../api/restaurantAPI'
import ReviewList from '../../components/Product/ReviewList'
import CreateReview from '../../components/Product/CreateReview'
import './ProductDetailPage.css'

const { Title, Text, Paragraph } = Typography

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [refreshReviews, setRefreshReviews] = useState(0)
  const [checking, setChecking] = useState(false)

  const fetchProduct = useCallback(async () => {
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
  }, [id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleAddToCart = async () => {
    try {
      setChecking(true)
      let isOpen = undefined
      const rest = product.restaurant
      if (rest) isOpen = rest.isOpen
      if (isOpen === undefined) {
        const restId = rest?._id || rest
        if (restId) {
          const resp = await restaurantAPI.getRestaurantById(restId)
          const data = resp.data?.data || resp.data
          isOpen = data?.isOpen
        }
      }

      if (isOpen === false) {
        message.error('Nhà hàng hiện đang đóng cửa, không thể thêm món này vào giỏ.')
        return
      }

      // Tính giá sau khi áp dụng discount
      const finalPrice = product.discount 
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price

      dispatch(addToCart({ ...product, quantity, price: finalPrice }))
      message.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`)
    } catch (err) {
      console.error('Error checking restaurant status', err)
      message.error('Không thể thêm vào giỏ hàng lúc này')
    } finally {
      setChecking(false)
    }
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
                  {product.promotion ? (
                    <>
                      <Text delete className="original-price">
                        {formatPrice(product.promotion.originalPrice)}
                      </Text>
                      <Title level={3} type="danger" className="discounted-price">
                        {formatPrice(product.price)}
                      </Title>
                      <Tag color="red">-{product.promotion.discountPercent}%</Tag>
                      <Tag color="volcano">{product.promotion.name}</Tag>
                    </>
                  ) : product.discount ? (
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
                  loading={checking}
                  style={{ marginTop: 20 }}
                >
                  Thêm vào giỏ hàng - {formatPrice((product.discount 
                    ? product.price * (1 - product.discount / 100) 
                    : product.price) * quantity)}
                </Button>

                {user && (
                  <Button
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() => setShowReviewModal(true)}
                    block
                    style={{ marginTop: 12 }}
                  >
                    Viết đánh giá
                  </Button>
                )}
              </div>
            </Col>
          </Row>

          {/* Phần đánh giá */}
          <Divider style={{ marginTop: 40 }} />
          <ReviewList 
            productId={id} 
            key={refreshReviews}
          />
        </Card>

        {/* Modal tạo đánh giá */}
        <CreateReview
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          productId={id}
          onSuccess={() => {
            setRefreshReviews(prev => prev + 1)
          }}
        />
      </div>
    </div>
  )
}

export default ProductDetailPage
