import { useState } from 'react'
import { Card, Button, Typography, Tag, Rate, Divider } from 'antd'
import { Link } from 'react-router-dom'
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import './RestaurantCard.css'

const { Meta } = Card
const { Text } = Typography

const RestaurantCard = ({ restaurant }) => {
  const [loading, setLoading] = useState(false)

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  return (
    <Card
      hoverable
      className="restaurant-card"
      cover={
        <div className="restaurant-image-wrapper">
          <img
            alt={restaurant.name}
            src={restaurant.image || '/placeholder-restaurant.jpg'}
            className="restaurant-image"
          />
          {restaurant.isOpen ? (
            <Tag color="green" className="status-tag">Đang mở cửa</Tag>
          ) : (
            <Tag color="red" className="status-tag">Đã đóng cửa</Tag>
          )}
        </div>
      }
    >
      <Link to={`/stores/${restaurant._id}`}>
        <Meta
          title={<div className="restaurant-name">{restaurant.name}</div>}
          description={
            <div className="restaurant-details">
              <div className="restaurant-info">
                <div className="info-item">
                  <EnvironmentOutlined />
                  <Text type="secondary">{formatDistance(restaurant.distance || 2.5)}</Text>
                </div>
                <div className="info-item">
                  <ClockCircleOutlined />
                  <Text type="secondary">{restaurant.deliveryTime || '20-30'} phút</Text>
                </div>
              </div>

              <div className="restaurant-rating">
                <StarOutlined style={{ color: '#fadb14' }} />
                <Text strong>{restaurant.rating || 4.5}</Text>
                <Text type="secondary">({restaurant.reviewCount || 0} đánh giá)</Text>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div className="restaurant-categories">
                {restaurant.categories?.slice(0, 3).map((cat) => (
                  <Tag key={cat} color="orange">{cat}</Tag>
                ))}
              </div>

              {restaurant.promo && (
                <div className="restaurant-promo">
                  <Tag color="red">🎉 {restaurant.promo}</Tag>
                </div>
              )}
            </div>
          }
        />
      </Link>

      <Button
        type="primary"
        block
        className="view-menu-btn"
        onClick={() => window.location.href = `/stores/${restaurant._id}`}
      >
        <ShopOutlined /> Xem thực đơn
      </Button>
    </Card>
  )
}

export default RestaurantCard
