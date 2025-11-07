import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Layout, 
  Menu, 
  Badge, 
  Avatar, 
  Dropdown, 
  Button, 
  Input,
  Space 
} from 'antd'
import {
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  MenuOutlined,
  SearchOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { logout } from '../../redux/slices/authSlice'
import './Header.css'

const { Header: AntHeader } = Layout
const { Search } = Input

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)
  const [searchValue, setSearchValue] = useState('')

  const [searchParams, setSearchParams] = useSearchParams()
  const debounceRef = useRef(null)

  // Keep header search input in sync with URL search param
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    setSearchValue(urlSearch)
  }, [location.search, searchParams])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleSearch = (value) => {
    if (value == null) return
    const trimmed = String(value).trim()
    // Navigate to menu and update the search query param (empty will clear param)
    if (trimmed) {
      navigate(`/menu?search=${encodeURIComponent(trimmed)}`)
      return
    }

    // Empty search: remove 'search' param and go to /menu
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('search')
    if (location.pathname === '/menu') {
      setSearchParams(newParams, { replace: true })
    } else {
      navigate('/menu')
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      icon: <ShopOutlined />,
      label: 'Đơn hàng của tôi',
      onClick: () => navigate('/order-history'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="site-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src="https://res.cloudinary.com/dp4o6la8b/image/upload/v1761115010/logo.jpg" alt="FoodFast" style={{ height: 40 }} />
          <span className="logo-text">FoodFast</span>
        </Link>

        {/* Location */}
        <div className="header-location">
          <EnvironmentOutlined />
          <span>Giao đến: <strong>273 TEST An Dương Vương, Phường, Chợ Quán, Thành phố Hồ Chí Minh 700000, Việt Nam</strong></span>
        </div>

        {/* Search */}
        <Search
          className="header-search"
          placeholder="Tìm kiếm món ăn, nhà hàng..."
          allowClear
          size="large"
          value={searchValue}
          onChange={(e) => {
            const val = e.target.value
            setSearchValue(val)
            // Debounce live sync to URL so Menu/ProductFilter update live
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
              const trimmed = String(val).trim()
              if (trimmed) {
                // if currently on /menu, just update params, otherwise navigate to /menu
                if (location.pathname === '/menu') {
                  setSearchParams({ search: trimmed }, { replace: true })
                } else {
                  navigate(`/menu?search=${encodeURIComponent(trimmed)}`)
                }
              } else {
                // clear param
                if (location.pathname === '/menu') {
                  const newParams = new URLSearchParams(searchParams)
                  newParams.delete('search')
                  setSearchParams(newParams, { replace: true })
                } else {
                  navigate('/menu')
                }
              }
            }, 300)
          }}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />

        {/* Menu */}
        <Space size="large" className="header-menu">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            <HomeOutlined /> Trang chủ
          </Link>
          <Link to="/menu" className={location.pathname === '/menu' ? 'active' : ''}>
            <MenuOutlined /> Thực đơn
          </Link>
          <Link to="/stores" className={location.pathname === '/stores' ? 'active' : ''}>
            <ShopOutlined /> Cửa hàng
          </Link>
        </Space>

        {/* Cart */}
        <Link to="/cart" className="header-cart">
          <Badge count={totalItems} overflowCount={99}>
            <ShoppingCartOutlined style={{ fontSize: 24 }} />
          </Badge>
        </Link>

        {/* User */}
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar 
              size="large" 
              icon={<UserOutlined />} 
              src={user?.avatar}
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        ) : (
          <Space>
            <Button type="default" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Đăng ký
            </Button>
          </Space>
        )}
      </div>
    </AntHeader>
  )
}

export default Header
