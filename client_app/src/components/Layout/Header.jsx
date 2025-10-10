import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/menu?search=${encodeURIComponent(value)}`)
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
          <img src="/logo.png" alt="FoodFast" style={{ height: 40 }} />
          <span className="logo-text">FoodFast</span>
        </Link>

        {/* Location */}
        <div className="header-location">
          <EnvironmentOutlined />
          <span>Giao đến: <strong>123 Lê Lợi, Q.1</strong></span>
        </div>

        {/* Search */}
        <Search
          className="header-search"
          placeholder="Tìm kiếm món ăn, nhà hàng..."
          allowClear
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
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
