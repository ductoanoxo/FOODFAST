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
  Space,
  Typography,
  Empty,
} from 'antd'
import { 
  UserOutlined, 
  ShopOutlined, 
  ShoppingOutlined, 
  RobotOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  UndoOutlined,
  CarOutlined,
} from '@ant-design/icons'

const { Text } = Typography
import { useEffect, useState } from 'react'
import {
  getDashboardStats,
  getRecentOrders,
  getTopRestaurants,
} from '../../api/dashboardAPI'
import './DashboardPage.css'

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [topRestaurants, setTopRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, ordersRes, restaurantsRes] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
        getTopRestaurants(5),
      ])

      setStats(statsRes.data)
      setRecentOrders(ordersRes.data)
      setTopRestaurants(restaurantsRes.data)
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
      title: 'Thanh toán',
      key: 'payment',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={
            record.paymentMethod === 'COD' ? 'green' :
            record.paymentMethod === 'VNPAY' ? 'blue' :
            record.paymentMethod === 'MOMO' ? 'magenta' : 'purple'
          }>
            {record.paymentMethod || 'COD'}
          </Tag>
          {record.paymentStatus && (
            <Tag color={
              record.paymentStatus === 'paid' ? 'success' :
              record.paymentStatus === 'refunded' ? 'error' :
              record.paymentStatus === 'failed' ? 'error' : 'warning'
            }>
              {record.paymentStatus}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.discount > 0 && (
            <Text type="danger">-{formatCurrency(record.discount)}</Text>
          )}
          {record.appliedVoucher && (
            <Tag color="orange" icon={<TagOutlined />}>
              {record.appliedVoucher.code}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Giao hàng',
      key: 'delivery',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.distanceKm && (
            <Text style={{ fontSize: 12 }}>
              <EnvironmentOutlined /> {record.distanceKm.toFixed(1)} km
            </Text>
          )}
          {record.estimatedDuration && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined /> ~{record.estimatedDuration} phút
            </Text>
          )}
          {record.drone && (
            <Tag color="blue" icon={<RobotOutlined />} style={{ fontSize: 11 }}>
              {record.drone.droneId}
            </Tag>
          )}
        </Space>
      ),
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

      {/* Payment, Delivery & Promotions Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Payment & Refund */}
        <Col xs={24} sm={12} lg={8}>
          <Card title={<><CreditCardOutlined /> Thanh toán & Hoàn tiền</>}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Đã hoàn tiền"
                  value={stats.payment?.refunded?.count || 0}
                  prefix={<UndoOutlined />}
                  valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Số tiền hoàn"
                  value={stats.payment?.refunded?.amount || 0}
                  suffix="₫"
                  valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                />
              </Col>
            </Row>
            {stats.payment?.methodBreakdown && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Phương thức thanh toán:</Text>
                <div style={{ marginTop: 8 }}>
                  {Object.entries(stats.payment.methodBreakdown).map(([method, count]) => (
                    <Tag 
                      key={method}
                      color={
                        method === 'COD' ? 'green' :
                        method === 'VNPAY' ? 'blue' :
                        method === 'MOMO' ? 'magenta' : 'purple'
                      }
                      style={{ marginBottom: 4 }}
                    >
                      {method}: {count}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Delivery Statistics */}
        <Col xs={24} sm={12} lg={8}>
          <Card title={<><CarOutlined /> Giao hàng</>}>
            {stats.delivery ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Khoảng cách TB"
                      value={stats.delivery.avgDistance || 0}
                      suffix="km"
                      precision={2}
                      valueStyle={{ color: '#1890ff', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Thời gian TB"
                      value={stats.delivery.avgDuration || 0}
                      suffix="phút"
                      valueStyle={{ color: '#52c41a', fontSize: 20 }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">
                      Phí giao TB: <Text strong>{formatCurrency(stats.delivery.avgDeliveryFee || 0)}</Text>
                    </Text>
                    <Text type="secondary">
                      Xa nhất: <Text strong>{stats.delivery.maxDistance?.toFixed(1) || 0} km</Text>
                    </Text>
                  </Space>
                </div>
              </>
            ) : (
              <Empty description="Chưa có dữ liệu giao hàng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* Promotions & Vouchers */}
        <Col xs={24} sm={12} lg={8}>
          <Card title={<><GiftOutlined /> Khuyến mãi & Voucher</>}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Đơn có voucher"
                  value={stats.promotions?.ordersWithVouchers || 0}
                  prefix={<TagOutlined />}
                  valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đơn có KM"
                  value={stats.promotions?.ordersWithPromotions || 0}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#eb2f96', fontSize: 20 }}
                />
              </Col>
            </Row>
            {stats.promotions?.discount && (
              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={Math.min(
                    stats.orders.total > 0 
                      ? (stats.promotions.discount.count / stats.orders.total) * 100 
                      : 0,
                    100
                  )}
                  strokeColor="#fa8c16"
                  format={(percent) => `${percent.toFixed(0)}%`}
                />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  Tổng giảm: <Text strong style={{ color: '#ff4d4f' }}>
                    {formatCurrency(stats.promotions.discount.total || 0)}
                  </Text>
                </Text>
              </div>
            )}
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
                          ⭐ {restaurant && restaurant.rating > 0 ? Number(restaurant.rating).toFixed(1) : '0.0'}
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
