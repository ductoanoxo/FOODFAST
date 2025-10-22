import { useEffect, useState } from 'react'
import { Row, Col, Typography, Spin, Empty } from 'antd'
import { productAPI } from '../../api'
import './CategoriesPage.css'

const { Title, Paragraph } = Typography

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const res = await productAPI.getCategories()
        setCategories(res.data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="categories-page container">
      <div className="page-header">
        <Title level={2}>Tất cả danh mục</Title>
        <Paragraph type="secondary">Chọn danh mục để xem món ăn tương ứng</Paragraph>
      </div>

      {categories.length === 0 ? (
        <Empty description="Không có danh mục nào" />
      ) : (
        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col xs={12} sm={8} md={6} lg={4} key={category._id}>
              <div
                className="category-card pretty"
                onClick={() => window.location.href = `/menu?category=${category._id}`}
                style={{
                  background: category.color || 'linear-gradient(135deg,#f8f9fa 0%, #f1f3f5 100%)'
                }}
              >
                <div className="category-media">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="category-img"
                      onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/dp4o6la8b/image/upload/v1761115010/iconfastfood.jpg' }}
                    />
                  ) : category.icon && /^https?:\/\//i.test(category.icon) ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="category-img"
                      onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/dp4o6la8b/image/upload/v1761115010/iconfastfood.jpg' }}
                    />
                  ) : (
                    <span className="category-emoji">{category.icon || '🍽️'}</span>
                  )}
                  <span className="category-ring" />
                </div>
                <Paragraph strong className="category-name">{category.name}</Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default CategoriesPage
