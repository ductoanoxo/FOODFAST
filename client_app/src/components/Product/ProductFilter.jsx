import { useState } from 'react'
import { Card, Input, Select, Slider, Button, Space, Tag } from 'antd'
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons'
import './ProductFilter.css'

const { Option } = Select

const ProductFilter = ({ filters, onFilterChange, categories, restaurants }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      restaurant: '',
      priceRange: [0, 500000],
      sortBy: 'popular',
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
  }

  return (
    <Card className="product-filter">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Search */}
        <div>
          <label className="filter-label">Tìm kiếm</label>
          <Input
            placeholder="Tìm món ăn..."
            prefix={<SearchOutlined />}
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            allowClear
          />
        </div>

        {/* Category */}
        <div>
          <label className="filter-label">Danh mục</label>
          <Select
            placeholder="Chọn danh mục"
            style={{ width: '100%' }}
            value={localFilters.category || undefined}
            onChange={(value) => handleChange('category', value)}
            allowClear
          >
            {categories?.map((cat) => (
              <Option key={cat._id} value={cat._id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Restaurant */}
        <div>
          <label className="filter-label">Nhà hàng</label>
          <Select
            placeholder="Chọn nhà hàng"
            style={{ width: '100%' }}
            value={localFilters.restaurant || undefined}
            onChange={(value) => handleChange('restaurant', value)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {restaurants?.map((restaurant) => (
              <Option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="filter-label">
            Khoảng giá: {formatPrice(localFilters.priceRange[0])} - {formatPrice(localFilters.priceRange[1])}
          </label>
          <Slider
            range
            min={0}
            max={500000}
            step={10000}
            value={localFilters.priceRange}
            onChange={(value) => handleChange('priceRange', value)}
            tooltip={{ formatter: formatPrice }}
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="filter-label">Sắp xếp</label>
          <Select
            style={{ width: '100%' }}
            value={localFilters.sortBy}
            onChange={(value) => handleChange('sortBy', value)}
          >
            <Option value="popular">Phổ biến nhất</Option>
            <Option value="rating">Đánh giá cao</Option>
            <Option value="price-asc">Giá tăng dần</Option>
            <Option value="price-desc">Giá giảm dần</Option>
            <Option value="newest">Mới nhất</Option>
          </Select>
        </div>

        {/* Actions */}
        <Button
          block
          icon={<ClearOutlined />}
          onClick={handleReset}
        >
          Xóa bộ lọc
        </Button>
      </Space>
    </Card>
  )
}

export default ProductFilter
