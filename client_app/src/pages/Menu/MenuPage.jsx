import { useState, useEffect } from 'react'
import { Row, Col, Typography, Spin, Empty, Pagination, Space, Tag } from 'antd'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { productAPI, restaurantAPI } from '../../api'
import ProductCard from '../../components/Product/ProductCard'
import ProductFilter from '../../components/Product/ProductFilter'
import './MenuPage.css'

const { Title, Text } = Typography

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    restaurant: '',
    priceRange: [0, 500000],
    sortBy: 'popular',
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Keep filters.search and category in sync with URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlCategory = searchParams.get('category') || ''
    setFilters((prev) => ({ ...prev, search: urlSearch, category: urlCategory }))
    setCurrentPage(1)
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [filters, currentPage])

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
      const params = {
        ...filters,
        page: currentPage,
        limit: pageSize,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
      }
      const response = await productAPI.getProducts(params)
      setProducts(response.data || [])
      setTotal(response.total || response.data?.length || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
    // Push search and category to URL so Header and other components read the same state
    const params = {}
    if (newFilters.search) params.search = newFilters.search
    if (newFilters.category) params.category = newFilters.category
    setSearchParams(params, { replace: true })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category) count++
    if (filters.restaurant) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) count++
    return count
  }

  return (
    <div className="menu-page">
      <div className="container">
        <div className="page-header">
          <Title level={2} className="page-title">Thực đơn</Title>
          {getActiveFiltersCount() > 0 && (
            <Tag color="blue">{getActiveFiltersCount()} bộ lọc đang áp dụng</Tag>
          )}
        </div>
        
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
            {/* Results Info */}
            <div className="results-info">
              <Text>
                {loading ? (
                  'Đang tải...'
                ) : (
                  <>
                    Hiển thị {products.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} - {Math.min(currentPage * pageSize, total)} trong tổng số <strong>{total}</strong> món ăn
                  </>
                )}
              </Text>
            </div>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="Đang tải món ăn..." />
              </div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[24, 24]}>
                  {products.map((product) => (
                    <Col xs={24} sm={12} lg={8} key={product._id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
                
                {/* Pagination */}
                {total > pageSize && (
                  <div className="pagination-container">
                    <Pagination
                      current={currentPage}
                      total={total}
                      pageSize={pageSize}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showTotal={(total) => `Tổng ${total} món`}
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty 
                description="Không tìm thấy món ăn nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default MenuPage
