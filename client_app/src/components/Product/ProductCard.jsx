import { Card, Rate, Tag, Button } from 'antd'
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/slices/cartSlice'
import { toast } from 'react-toastify'
import './ProductCard.css'
import { restaurantAPI } from '../../api/restaurantAPI'
import { useState } from 'react'

const { Meta } = Card

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    dispatch(addToCart(product))
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  // Updated: check restaurant open status before adding to cart
  const [checking, setChecking] = useState(false)
  const handleAddToCartChecked = async (e) => {
    e.stopPropagation()
    try {
      setChecking(true)
      // If restaurant object already included with isOpen, use it
      const rest = product.restaurant
      let isOpen = undefined
      if (rest) {
        isOpen = rest.isOpen
      }
      // If isOpen undefined, fetch restaurant
      if (isOpen === undefined) {
        const restId = rest?._id || rest
        if (restId) {
          const resp = await restaurantAPI.getRestaurantById(restId)
          const data = resp.data?.data || resp.data
          isOpen = data?.isOpen
        }
      }

      if (isOpen === false) {
        toast.error('Nhà hàng hiện đang đóng cửa, không thể thêm món này vào giỏ.')
        return
      }

      dispatch(addToCart(product))
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
    } catch (err) {
      console.error('Error checking restaurant status', err)
      toast.error('Không thể thêm vào giỏ hàng lúc này')
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
          {product.promotion && (
            <Tag color="red" className="discount-tag">
              -{product.promotion.discountPercent}%
            </Tag>
          )}
          {!product.promotion && product.discount && (
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
            onClick={handleAddToCartChecked}
            block
            loading={checking}
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
              {product.promotion ? (
                <>
                  <span className="original-price">{formatPrice(product.promotion.originalPrice)}</span>
                  <span className="discounted-price">
                    {formatPrice(product.price)}
                  </span>
                  <Tag color="volcano" style={{ marginLeft: 8 }}>
                    {product.promotion.name}
                  </Tag>
                </>
              ) : product.discount ? (
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
