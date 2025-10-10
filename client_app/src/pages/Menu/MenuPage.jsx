import { useState, useEffect } from 'react'
import { Row, Col, Typography, Spin, Empty } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { productAPI, restaurantAPI } from '../../api'
import ProductCard from '../../components/Product/ProductCard'
import ProductFilter from '../../components/Product/ProductFilter'
import './MenuPage.css'

const { Title } = Typography

const MenuPage = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    restaurant: '',
    priceRange: [0, 500000],
    sortBy: 'popular',
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchData = async () => {
    try {
      const [categoriesRes, restaurantsRes] = await Promise.all([
        productAPI.getCategories(),
        restaurantAPI.getRestaurants()
      ])
      setCategories(categoriesRes.data || [])
      setRestaurants(restaurantsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts(filters)
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="menu-page">
      <div className="container">
        <Title level={2} className="page-title">Thực đơn</Title>
        
        <Row gutter={[24, 24]}>
          {/* Filters */}
          <Col xs={24} lg={6}>
            <ProductFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              restaurants={restaurants}
            />
          </Col>

          {/* Products Grid */}
          <Col xs={24} lg={18}>
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : products.length > 0 ? (
              <Row gutter={[24, 24]}>
                {products.map((product) => (
                  <Col xs={24} sm={12} md={8} key={product._id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Không tìm thấy món ăn nào" />
            )}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default MenuPage
