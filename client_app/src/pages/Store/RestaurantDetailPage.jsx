import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Row, 
  Col, 
  Typography, 
  Spin, 
  Empty, 
  Tag, 
  Button, 
  Divider,
  Card,
  Space,
  message
} from 'antd'
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  StarOutlined,
  PhoneOutlined,
  LeftOutlined,
  ShopOutlined
} from '@ant-design/icons'
import { restaurantAPI } from '../../api'
import ProductCard from '../../components/Product/ProductCard'
import ReviewList from '../../components/Product/ReviewList'
import './RestaurantDetailPage.css'

const { Title, Text, Paragraph } = Typography

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    if (id) {
      fetchRestaurantData()
    }
  }, [id])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      
      // Fetch restaurant menu (includes both restaurant details and products)
      const menuRes = await restaurantAPI.getRestaurantMenu(id)
      
      if (menuRes.data) {
        setRestaurant(menuRes.data.restaurant)
        setProducts(menuRes.data.products || [])
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      message.error('Không thể tải thông tin nhà hàng')
    } finally {
      setLoading(false)
    }
  }

  const formatDistance = (distance) => {
    if (!distance) return 'N/A'
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Khác'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {})

  const categories = ['all', ...Object.keys(groupedProducts)]

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : groupedProducts[activeCategory] || []

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spin size="large" tip="Đang tải thông tin nhà hàng..." />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="container" style={{ padding: '50px 0' }}>
        <Empty description="Không tìm thấy nhà hàng" />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button type="primary" onClick={() => navigate('/stores')}>
            Quay lại danh sách nhà hàng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="restaurant-detail-page">
      {/* Back Button */}
      <div className="container">
        <Button 
          icon={<LeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          Quay lại
        </Button>
      </div>

      {/* Restaurant Header */}
      <div className="restaurant-header">
        <div className="restaurant-cover">
          <img 
            src={restaurant.image || '/placeholder-restaurant.jpg'} 
            alt={restaurant.name}
          />
        </div>
        
        <div className="container">
          <Card className="restaurant-info-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={2} style={{ marginBottom: 8 }}>
                      {restaurant.name}
                    </Title>
                    {restaurant.isOpen ? (
                      <Tag color="green" style={{ fontSize: 14 }}>Đang mở cửa</Tag>
                    ) : (
                      <Tag color="red" style={{ fontSize: 14 }}>Đã đóng cửa</Tag>
                    )}
                  </div>

                  <div className="restaurant-meta">
                    <Space size="large" wrap>
                      <div className="meta-item">
                        <StarOutlined style={{ color: '#fadb14', fontSize: 18 }} />
                        <Text strong style={{ fontSize: 16, marginLeft: 8 }}>
                          {restaurant.rating || 4.5}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({restaurant.reviewCount || 0} đánh giá)
                        </Text>
                      </div>
                      
                      <div className="meta-item">
                        <EnvironmentOutlined style={{ fontSize: 18 }} />
                        <Text style={{ marginLeft: 8 }}>
                          {formatDistance(restaurant.distance)}
                        </Text>
                      </div>
                      
                      <div className="meta-item">
                        <ClockCircleOutlined style={{ fontSize: 18 }} />
                        <Text style={{ marginLeft: 8 }}>
                          {restaurant.deliveryTime || '20-30'} phút
                        </Text>
                      </div>

                      {restaurant.phone && (
                        <div className="meta-item">
                          <PhoneOutlined style={{ fontSize: 18 }} />
                          <Text style={{ marginLeft: 8 }}>{restaurant.phone}</Text>
                        </div>
                      )}
                    </Space>
                  </div>

                  {restaurant.description && (
                    <Paragraph type="secondary">
                      {restaurant.description}
                    </Paragraph>
                  )}

                  {restaurant.categories && restaurant.categories.length > 0 && (
                    <div>
                      <Text strong>Danh mục: </Text>
                      {restaurant.categories.map((cat, index) => (
                        <Tag key={index} color="orange" style={{ marginTop: 8 }}>
                          {cat}
                        </Tag>
                      ))}
                    </div>
                  )}

                  {restaurant.promo && (
                    <div className="restaurant-promo">
                      {typeof restaurant.promo === 'string' ? (
                        <Tag color="red" style={{ fontSize: 14, padding: '8px 12px' }}>
                          🎉 {restaurant.promo}
                        </Tag>
                      ) : (
                        <Tag color="red" style={{ fontSize: 14, padding: '8px 12px' }}>
                          🎉 {restaurant.promo.text}
                          {restaurant.promo.discountPercent && ` - Giảm ${restaurant.promo.discountPercent}%`}
                          {restaurant.promo.minOrder && ` (Đơn từ ${(restaurant.promo.minOrder / 1000).toFixed(0)}k)`}
                        </Tag>
                      )}
                    </div>
                  )}
                </Space>
              </Col>

              <Col xs={24} md={8}>
                {restaurant.address && (
                  <Card size="small" title="Địa chỉ">
                    <Text>{restaurant.address}</Text>
                  </Card>
                )}
              </Col>
            </Row>
          </Card>
        </div>
      </div>

      <Divider />

      {/* Menu Section */}
      <div className="container">
        <div className="menu-section">
          <div className="section-header">
            <Title level={3}>
              <ShopOutlined /> Thực đơn
            </Title>
            <Text type="secondary">
              {products.length} món ăn
            </Text>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="category-filter" style={{ marginBottom: 24 }}>
              <Space wrap>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    type={activeCategory === cat ? 'primary' : 'default'}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'all' ? 'Tất cả' : cat}
                    {cat !== 'all' && ` (${groupedProducts[cat]?.length || 0})`}
                  </Button>
                ))}
              </Space>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredProducts.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="Nhà hàng chưa có món ăn nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>

        {/* Restaurant Reviews Section */}
        <Divider />
        <div className="reviews-section">
          <ReviewList restaurantId={id} type="restaurant" />
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetailPage
