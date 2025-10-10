import { useState, useEffect } from 'react'
import { Row, Col, Typography, Spin, Empty, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { restaurantAPI } from '../../api'
import RestaurantCard from '../../components/Restaurant/RestaurantCard'
import './StorePage.css'

const { Title } = Typography
const { Search } = Input

const StorePage = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const response = await restaurantAPI.getRestaurants()
      setRestaurants(response.data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="store-page">
      <div className="container">
        <div className="page-header">
          <Title level={2}>Nhà hàng & Cửa hàng</Title>
          <Search
            placeholder="Tìm kiếm nhà hàng..."
            allowClear
            size="large"
            style={{ maxWidth: 400 }}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredRestaurants.map((restaurant) => (
              <Col xs={24} sm={12} md={8} lg={6} key={restaurant._id}>
                <RestaurantCard restaurant={restaurant} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không tìm thấy nhà hàng nào" />
        )}
      </div>
    </div>
  )
}

export default StorePage
