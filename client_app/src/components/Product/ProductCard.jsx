import { Card, Rate, Tag, Button } from 'antd'
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/slices/cartSlice'
import { toast } from 'react-toastify'
import './ProductCard.css'

const { Meta } = Card

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    dispatch(addToCart(product))
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <div className="product-image-wrapper">
          <img
            alt={product.name}
            src={product.image || '/placeholder-food.jpg'}
            className="product-image"
          />
          {product.discount && (
            <Tag color="red" className="discount-tag">
              -{product.discount}%
            </Tag>
          )}
          <Button
            type="text"
            icon={<HeartOutlined />}
            className="favorite-btn"
          />
        </div>
      }
      actions={[
        <Button
          key="addcart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          block
        >
          Thêm vào giỏ
        </Button>,
      ]}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <Meta
        title={<div className="product-name">{product.name}</div>}
        description={
          <div className="product-details">
            <div className="product-restaurant">{product.restaurant?.name}</div>
            <div className="product-rating">
              <Rate disabled defaultValue={product.rating || 5} />
              <span className="rating-count">({product.reviewCount || 0})</span>
            </div>
            <div className="product-price">
              {product.discount ? (
                <>
                  <span className="original-price">{formatPrice(product.price)}</span>
                  <span className="discounted-price">
                    {formatPrice(product.price * (1 - product.discount / 100))}
                  </span>
                </>
              ) : (
                <span className="current-price">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default ProductCard
