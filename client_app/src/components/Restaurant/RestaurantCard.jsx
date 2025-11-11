import { Card, Button, Typography, Tag, Divider } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import './RestaurantCard.css'
import PropTypes from 'prop-types'

const { Meta } = Card
const { Text } = Typography

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate()

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
                  {typeof restaurant.promo === 'string' ? (
                    <Tag color="red">🎉 {restaurant.promo}</Tag>
                  ) : (
                    <Tag color="red">
                      🎉 {restaurant.promo.text}
                      {restaurant.promo.discountPercent && ` - Giảm ${restaurant.promo.discountPercent}%`}
                      {restaurant.promo.minOrder && ` (Đơn từ ${(restaurant.promo.minOrder / 1000).toFixed(0)}k)`}
                    </Tag>
                  )}
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
        onClick={() => navigate(`/stores/${restaurant._id}`)}
      >
        <ShopOutlined /> Xem thực đơn
      </Button>
    </Card>
  )
}

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    isOpen: PropTypes.bool,
    distance: PropTypes.number,
    deliveryTime: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    categories: PropTypes.arrayOf(PropTypes.string),
    promo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        text: PropTypes.string,
        discountPercent: PropTypes.number,
        minOrder: PropTypes.number,
      })
    ])
  }).isRequired
}

export default RestaurantCard
