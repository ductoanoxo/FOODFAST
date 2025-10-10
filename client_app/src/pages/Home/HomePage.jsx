import { useEffect, useState } from 'react'
import { Row, Col, Typography, Carousel, Card, Button, Space, Spin } from 'antd'
import { RocketOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { productAPI, restaurantAPI } from '../../api'
import ProductCard from '../../components/Product/ProductCard'
import RestaurantCard from '../../components/Restaurant/RestaurantCard'
import './HomePage.css'

const { Title, Paragraph } = Typography

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, restaurantsRes] = await Promise.all([
        productAPI.getPopularProducts(),
        restaurantAPI.getRestaurants({ limit: 8 })
      ])
      setPopularProducts(productsRes.data || [])
      setRestaurants(restaurantsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const carouselItems = [
    {
      image: '/banner1.jpg',
      title: 'Giao hàng nhanh bằng Drone',
      description: 'Nhận đồ ăn trong 15-20 phút với công nghệ drone hiện đại',
      color: '#ff6b35'
    },
    {
      image: '/banner2.jpg',
      title: 'Hàng ngàn món ngon',
      description: 'Khám phá đa dạng món ăn từ các nhà hàng hàng đầu',
      color: '#4ecdc4'
    },
    {
      image: '/banner3.jpg',
      title: 'Ưu đãi mỗi ngày',
      description: 'Giảm giá lên đến 50% cho đơn hàng đầu tiên',
      color: '#f7b731'
    }
  ]

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: 48, color: '#ff6b35' }} />,
      title: 'Giao siêu nhanh',
      description: 'Drone giao hàng chỉ trong 15-20 phút'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#4ecdc4' }} />,
      title: 'An toàn tuyệt đối',
      description: 'Đảm bảo vệ sinh và chất lượng món ăn'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 48, color: '#f7b731' }} />,
      title: 'Ưu đãi hấp dẫn',
      description: 'Nhiều chương trình khuyến mãi mỗi ngày'
    }
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <Carousel autoplay className="hero-carousel">
        {carouselItems.map((item, index) => (
          <div key={index}>
            <div 
              className="carousel-item"
              style={{ 
                background: `linear-gradient(135deg, ${item.color}dd 0%, ${item.color}99 100%)`
              }}
            >
              <div className="carousel-content">
                <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>
                  {item.title}
                </Title>
                <Paragraph style={{ color: '#fff', fontSize: 18, marginBottom: 32 }}>
                  {item.description}
                </Paragraph>
                <Button type="primary" size="large" ghost>
                  Đặt ngay
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Features */}
      <div className="container features-section">
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-icon">{feature.icon}</div>
                <Title level={3}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Popular Products */}
      <div className="container section">
        <div className="section-header">
          <Title level={2}>Món ăn phổ biến 🔥</Title>
          <Button type="link" onClick={() => window.location.href = '/menu'}>
            Xem tất cả →
          </Button>
        </div>
        <Row gutter={[24, 24]}>
          {popularProducts.slice(0, 8).map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Restaurants */}
      <div className="container section">
        <div className="section-header">
          <Title level={2}>Nhà hàng nổi bật ⭐</Title>
          <Button type="link" onClick={() => window.location.href = '/stores'}>
            Xem tất cả →
          </Button>
        </div>
        <Row gutter={[24, 24]}>
          {restaurants.map((restaurant) => (
            <Col xs={24} sm={12} md={8} lg={6} key={restaurant._id}>
              <RestaurantCard restaurant={restaurant} />
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <Card className="cta-card">
            <Title level={2} style={{ color: '#fff' }}>
              Trở thành đối tác của FoodFast
            </Title>
            <Paragraph style={{ color: '#fff', fontSize: 16, marginBottom: 24 }}>
              Gia tăng doanh thu với hệ thống giao hàng drone hiện đại nhất Việt Nam
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" ghost>
                Đăng ký ngay
              </Button>
              <Button size="large" style={{ background: '#fff' }}>
                Tìm hiểu thêm
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HomePage
