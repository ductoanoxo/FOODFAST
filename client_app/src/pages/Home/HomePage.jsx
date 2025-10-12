import { useEffect, useState } from 'react'
import { Row, Col, Typography, Carousel, Card, Button, Space, Spin } from 'antd'
import { 
  RocketOutlined, 
  SafetyOutlined, 
  ThunderboltOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  SendOutlined
} from '@ant-design/icons'
import { productAPI, restaurantAPI } from '../../api'
import ProductCard from '../../components/Product/ProductCard'
import RestaurantCard from '../../components/Restaurant/RestaurantCard'
import './HomePage.css'

const { Title, Paragraph } = Typography

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

    const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, restaurantsRes, categoriesRes] = await Promise.all([
        productAPI.getPopularProducts(),
        restaurantAPI.getRestaurants({ limit: 6 }),
        productAPI.getCategories() // ✅ Lấy trực tiếp từ Category model
      ])

      const extractArray = (res) => {
        if (!res) return []
        if (Array.isArray(res)) return res
        if (res.data && Array.isArray(res.data)) return res.data
        if (res.success && Array.isArray(res.data)) return res.data
        return []
      }

      const productsData = extractArray(productsRes)
      const restaurantsData = extractArray(restaurantsRes)
      const categoriesData = extractArray(categoriesRes)

      setPopularProducts(productsData)
      setRestaurants(restaurantsData)
      
      // ✅ Sử dụng categories trực tiếp từ database
      // Categories đã có đầy đủ: _id, name, icon, image, description
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const carouselItems = [
    {
      image: 'http://localhost:5000/uploads/drone.jpg',
      title: 'Giao hàng nhanh bằng Drone',
      description: 'Nhận đồ ăn trong 15-20 phút với công nghệ drone hiện đại',
      color: '#ff6b35'
    },
    {
      image: 'http://localhost:5000/uploads/khamphamonan.jpg',
      title: 'Hàng ngàn món ngon',
      description: 'Khám phá đa dạng món ăn từ các nhà hàng hàng đầu',
      color: '#4ecdc4'
    },
    {
      image: 'http://localhost:5000/uploads/sale.jpg',
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

  const howItWorksSteps = [
    {
      title: 'Đặt món',
      description: 'Chọn món ăn yêu thích từ hàng trăm nhà hàng',
      icon: <ShoppingOutlined style={{ fontSize: 48, color: '#ff6b35' }} />
    },
    {
      title: 'Xác nhận',
      description: 'Nhà hàng chuẩn bị món ăn của bạn',
      icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#4ecdc4' }} />
    },
    {
      title: 'Giao tận nơi',
      description: 'Drone giao hàng nhanh chóng đến tay bạn',
      icon: <SendOutlined style={{ fontSize: 48, color: '#f7b731' }} />
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
            <div className="carousel-item">
              <img src={item.image} alt={item.title} className="carousel-bg" />
              <div
                className="carousel-overlay"
                style={{ background: `linear-gradient(135deg, ${item.color}33 0%, ${item.color}2 100%)` }}
              />
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

      {/* Categories */}
      <div className="container section">
        <div className="section-header">
          <Title level={2}>Danh mục món ăn 🍽️</Title>
          <Button type="link" onClick={() => window.location.href = '/menu'}>
            Xem thêm →
          </Button>
        </div>

<div className="category-row">
  {categories.slice(0, 5).map((category, index) => (
    <div
      className="category-card pretty"
      key={category._id}
      onClick={() => window.location.href = `/menu?category=${category._id}`}
      style={{
        background: category.color || 'linear-gradient(135deg,#f8f9fa 0%, #f1f3f5 100%)',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div className="category-media">
        {/* Ưu tiên: image > icon > fallback */}
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="category-img"
            onError={(e) => { e.currentTarget.src = 'http://localhost:5000/uploads/iconfastfood.jpg' }}
          />
        ) : category.icon && /^https?:\/\//i.test(category.icon) ? (
          <img
            src={category.icon}
            alt={category.name}
            className="category-img"
            onError={(e) => { e.currentTarget.src = 'http://localhost:5000/uploads/iconfastfood.jpg' }}
          />
        ) : (
          <span className="category-emoji">{category.icon || '🍽️'}</span>
        )}
        <span className="category-ring" />
      </div>
      <Paragraph strong className="category-name">{category.name}</Paragraph>
    </div>
  ))}
</div>

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

      {/* How It Works */}
      <div className="how-it-works-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Cách thức hoạt động ⚡
          </Title>
          <Row gutter={[48, 48]} justify="center">
            {howItWorksSteps.map((step, index) => (
              <Col xs={24} md={8} key={index}>
                <Card className="how-it-works-card" bordered={false}>
                  <div className="step-number">{index + 1}</div>
                  <div className="step-icon">{step.icon}</div>
                  <Title level={3} style={{ marginTop: 16 }}>{step.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 15 }}>
                    {step.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
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
