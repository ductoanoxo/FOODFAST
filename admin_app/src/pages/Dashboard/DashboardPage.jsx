import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  List, 
  Avatar,
  Progress,
  Spin,
  message,
} from 'antd'
import { 
  UserOutlined, 
  ShopOutlined, 
  ShoppingOutlined, 
  RobotOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import {
  getDashboardStats,
  getRecentOrders,
  getTopRestaurants,
  getOrderStatistics,
} from '../../api/dashboardAPI'
import './DashboardPage.css'

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [topRestaurants, setTopRestaurants] = useState([])
  const [orderStats, setOrderStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, ordersRes, restaurantsRes, orderStatsRes] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
        getTopRestaurants(5),
        getOrderStatistics(7),
      ])

      setStats(statsRes.data)
      setRecentOrders(ordersRes.data)
      setTopRestaurants(restaurantsRes.data)
      setOrderStats(orderStatsRes.data)
    } catch (error) {
      console.error('Dashboard error:', error)
      message.error('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      confirmed: 'blue',
      preparing: 'cyan',
      ready: 'purple',
      picked_up: 'geekblue',
      delivering: 'processing',
      delivered: 'success',
      cancelled: 'error',
    }
    return colors[status] || 'default'
  }

  const getOrderStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      picked_up: 'Đã lấy hàng',
      delivering: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    }
    return texts[status] || status
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const recentOrdersColumns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <code>{id.slice(-8)}</code>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.name || 'N/A',
    },
    {
      title: 'Nhà hàng',
      dataIndex: 'restaurant',
      key: 'restaurant',
      render: (restaurant) => restaurant?.name || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {getOrderStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    )
  }

  if (!stats) {
    return <div>Không có dữ liệu</div>
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard - Tổng quan hệ thống</h1>

      {/* Main Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-users">
            <Statistic
              title="Tổng người dùng"
              value={stats.users.total}
              prefix={<UserOutlined />}
              suffix={
                <div className="stat-detail">
                  <small>{stats.users.active} hoạt động</small>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-restaurants">
            <Statistic
              title="Tổng nhà hàng"
              value={stats.restaurants.total}
              prefix={<ShopOutlined />}
              suffix={
                <div className="stat-detail">
                  <small>{stats.restaurants.active} hoạt động</small>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-orders">
            <Statistic
              title="Tổng đơn hàng"
              value={stats.orders.total}
              prefix={<ShoppingOutlined />}
              suffix={
                <div className="stat-detail">
                  <small>{stats.orders.today} hôm nay</small>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-drones">
            <Statistic
              title="Tổng Drone"
              value={stats.drones.total}
              prefix={<RobotOutlined />}
              suffix={
                <div className="stat-detail">
                  <small>{stats.drones.available} sẵn sàng</small>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue & Order Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><DollarOutlined /> Doanh thu</>} className="revenue-card">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Tổng doanh thu"
                  value={stats.revenue.total}
                  precision={0}
                  prefix="₫"
                  valueStyle={{ color: '#3f8600', fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Doanh thu hôm nay"
                  value={stats.revenue.today}
                  precision={0}
                  prefix="₫"
                  valueStyle={{ color: '#1890ff', fontSize: 24 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><ShoppingOutlined /> Trạng thái đơn hàng</>}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Chờ xử lý"
                  value={stats.orders.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đã giao"
                  value={stats.orders.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đã hủy"
                  value={stats.orders.cancelled}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Progress
                percent={
                  stats.orders.total > 0
                    ? Math.round((stats.orders.completed / stats.orders.total) * 100)
                    : 0
                }
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <p style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                Tỷ lệ hoàn thành: {' '}
                {stats.orders.total > 0
                  ? Math.round((stats.orders.completed / stats.orders.total) * 100)
                  : 0}%
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title={<><ClockCircleOutlined /> Đơn hàng gần đây</>}>
            <Table
              dataSource={recentOrders}
              columns={recentOrdersColumns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Top Restaurants */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<><StarOutlined /> Top nhà hàng</>}>
            <List
              itemLayout="horizontal"
              dataSource={topRestaurants}
              renderItem={(restaurant, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={50}
                        src={restaurant.image}
                        icon={<ShopOutlined />}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{restaurant.name}</span>
                        <Tag color="gold">
                          ⭐ {restaurant.rating?.toFixed(1) || 'N/A'}
                        </Tag>
                      </div>
                    }
                    description={
                      <>
                        <div>{restaurant.address}</div>
                        <small style={{ color: '#999' }}>
                          {restaurant.reviewCount || 0} đánh giá
                        </small>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col xs={24} lg={12}>
          <Card title="Thống kê nhanh">
            <List size="small">
              <List.Item>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                  title="Tỷ lệ hoàn thành"
                  description={`${stats.orders.total > 0 ? Math.round((stats.orders.completed / stats.orders.total) * 100) : 0}% đơn hàng được giao thành công`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title="Drone khả dụng"
                  description={`${stats.drones.available}/${stats.drones.total} drone sẵn sàng hoạt động`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<ShopOutlined style={{ fontSize: 24, color: '#fa8c16' }} />}
                  title="Nhà hàng hoạt động"
                  description={`${stats.restaurants.active}/${stats.restaurants.total} nhà hàng đang mở cửa`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                  title="Người dùng hoạt động"
                  description={`${stats.users.active}/${stats.users.total} người dùng đang hoạt động`}
                />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
