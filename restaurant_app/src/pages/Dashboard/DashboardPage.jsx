import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Empty, Table, Select, Space, message, Tag, Progress } from 'antd';
import PropTypes from 'prop-types';
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TagOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  CarOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Line,
  Area,
  ComposedChart
} from 'recharts';
import dayjs from 'dayjs';
import { getRestaurantStats, getRestaurantOrders, getRestaurantMenu } from '../../api/restaurantAPI';
import './DashboardPage.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Ngày: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString('vi-VN')}${entry.name.includes('Doanh thu') || entry.name.includes('Giá trị') ? '₫' : ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.number,
  })),
  label: PropTypes.string,
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, thisMonth
  const [recentOrdersLimit, setRecentOrdersLimit] = useState(5); // Number of recent orders to show
  
  // State for data from database
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    ordersByStatus: {},
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date range based on timeRange
      let days = 7;
      if (timeRange === '7days') days = 7;
      else if (timeRange === '30days') days = 30;
      else if (timeRange === 'thisMonth') days = dayjs().date();

      const startDate = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD');
      const endDate = dayjs().format('YYYY-MM-DD');

      // Get yesterday's date for comparison
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const yesterdayParams = { startDate: yesterday, endDate: yesterday };

      // Get stats from backend - parallel calls
      const statsParams = { startDate, endDate };
      const [statsRes, ordersRes, , yesterdayStatsRes] = await Promise.all([
        getRestaurantStats(statsParams),
        getRestaurantOrders(statsParams),
        getRestaurantMenu(),
        getRestaurantStats(yesterdayParams), // Get yesterday's stats
      ]);

      // Set stats from backend
      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      // Set yesterday's revenue from backend
      if (yesterdayStatsRes?.data) {
        setYesterdayRevenue(yesterdayStatsRes.data.totalRevenue || 0);
      }

      // Process orders for chart
      if (ordersRes?.data) {
        const orders = ordersRes.data;
        
        // Set recent orders
        setRecentOrders(orders.slice(0, recentOrdersLimit));

        // Calculate revenue by day
        const revenueMap = {};
        const ordersMap = {};

        for (let i = days - 1; i >= 0; i--) {
          const date = dayjs().subtract(i, 'day');
          const dateKey = date.format('DD/MM');
          const dateStr = date.format('YYYY-MM-DD');

          const dayOrders = orders.filter((order) => {
            const orderDate = dayjs(order.createdAt).format('YYYY-MM-DD');
            return orderDate === dateStr;
          });

          const completedOrders = dayOrders.filter(
            (o) => o.status === 'completed' || o.status === 'delivered'
          );

          const revenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

          revenueMap[dateKey] = revenue;
          ordersMap[dateKey] = dayOrders.length;
        }

        // Convert to array for chart
        const chartData = Object.keys(revenueMap).map((dateKey) => ({
          date: dateKey,
          revenue: revenueMap[dateKey],
          orders: ordersMap[dateKey],
          avgOrderValue: ordersMap[dateKey] > 0 
            ? Math.round(revenueMap[dateKey] / ordersMap[dateKey]) 
            : 0,
        }));

        setRevenueData(chartData);

        // Calculate growth rate
        const midPoint = Math.floor(chartData.length / 2);
        const firstHalf = chartData.slice(0, midPoint);
        const secondHalf = chartData.slice(midPoint);

        const firstHalfRevenue = firstHalf.reduce((sum, d) => sum + d.revenue, 0);
        const secondHalfRevenue = secondHalf.reduce((sum, d) => sum + d.revenue, 0);

        if (firstHalfRevenue > 0) {
          const growth = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;
          setRevenueGrowth(growth);
        } else {
          setRevenueGrowth(secondHalfRevenue > 0 ? 100 : 0);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      const errorMsg = error?.response?.data?.message || error?.message || error || 'Không thể tải dữ liệu dashboard';
      message.error(errorMsg);
      
      // Set empty data to prevent UI crash
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        todayOrders: 0,
        todayRevenue: 0,
        avgOrderValue: 0,
        revenueChange: 0,
        ordersByStatus: {},
      });
      setRevenueData([]);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange, recentOrdersLimit]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const todayGrowth = yesterdayRevenue > 0 
    ? ((stats.todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : stats.todayRevenue > 0 ? 100 : 0;

  const statusColors = {
    pending: '#faad14',
    confirmed: '#1890ff',
    preparing: '#1890ff',
    ready: '#722ed1',
    delivering: '#722ed1',
    completed: '#52c41a',
    delivered: '#52c41a',
  };

  // Prepare pie chart data from backend stats
  const pieData = [
    { 
      name: 'Chờ xác nhận', 
      value: (stats.ordersByStatus?.pending || 0) + (stats.ordersByStatus?.confirmed || 0), 
      color: statusColors.pending 
    },
    { 
      name: 'Đang chuẩn bị', 
      value: (stats.ordersByStatus?.preparing || 0) + (stats.ordersByStatus?.ready || 0), 
      color: statusColors.preparing 
    },
    { 
      name: 'Đang giao', 
      value: stats.ordersByStatus?.delivering || 0, 
      color: statusColors.delivering 
    },
    { 
      name: 'Hoàn thành', 
      value: (stats.ordersByStatus?.completed || 0) + (stats.ordersByStatus?.delivered || 0), 
      color: statusColors.completed 
    },
  ].filter(item => item.value > 0);

  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      key: '_id',
      render: (id) => `#${id?.slice(-6).toUpperCase()}`,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'name'],
      key: 'customer',
      render: (name) => name || 'N/A',
    },
    {
      title: 'Số tiền',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.appliedVoucher && (
            <Tag color="orange" icon={<TagOutlined />} style={{ fontSize: 11 }}>
              {record.appliedVoucher.code}
            </Tag>
          )}

          {record.distanceKm && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              <EnvironmentOutlined /> {record.distanceKm.toFixed(1)} km
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
      render: (status) => {
        const statusMap = {
          pending: 'Chờ xác nhận',
          preparing: 'Đang chuẩn bị',
          ready: 'Sẵn sàng',
          delivering: 'Đang giao',
          completed: 'Hoàn thành',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'time',
      render: (time) => dayjs(time).format('HH:mm DD/MM'),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Title level={2}>Dashboard</Title>
      <Text type="secondary">Tổng quan hoạt động nhà hàng</Text>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={(stats.ordersByStatus?.completed || 0) + (stats.ordersByStatus?.delivered || 0)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: todayGrowth >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <div style={{ marginTop: 8 }}>
              {todayGrowth >= 0 ? (
                <Text type="success">
                  <ArrowUpOutlined /> {todayGrowth.toFixed(1)}% so với hôm qua
                </Text>
              ) : (
                <Text type="danger">
                  <ArrowDownOutlined /> {Math.abs(todayGrowth).toFixed(1)}% so với hôm qua
                </Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Biểu đồ doanh thu</span>
                <Select 
                  value={timeRange} 
                  onChange={setTimeRange}
                  style={{ width: 150 }}
                >
                  <Option value="7days">7 ngày qua</Option>
                  <Option value="30days">30 ngày qua</Option>
                  <Option value="thisMonth">Tháng này</Option>
                </Select>
              </div>
            }
            extra={
              revenueGrowth !== 0 && (
                <Space>
                  {revenueGrowth >= 0 ? (
                    <Text type="success">
                      <RiseOutlined /> Tăng trưởng {revenueGrowth.toFixed(1)}%
                    </Text>
                  ) : (
                    <Text type="danger">
                      <FallOutlined /> Giảm {Math.abs(revenueGrowth).toFixed(1)}%
                    </Text>
                  )}
                </Space>
              )
            }
          >
            {revenueData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Doanh thu" 
                      fill="url(#colorRevenue)" 
                      stroke="#667eea"
                      strokeWidth={2}
                    />
                    <Bar 
                      dataKey="orders" 
                      name="Số đơn hàng" 
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={40}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgOrderValue" 
                      name="Giá trị TB/đơn" 
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                
                {/* Revenue Summary */}
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={8}>
                    <Card size="small" style={{ background: '#f0f5ff', border: 'none' }}>
                      <Statistic 
                        title="Tổng doanh thu"
                        value={revenueData.reduce((sum, d) => sum + d.revenue, 0)}
                        suffix="₫"
                        valueStyle={{ fontSize: 18, color: '#667eea' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ background: '#fff7e6', border: 'none' }}>
                      <Statistic 
                        title="Tổng đơn hàng"
                        value={revenueData.reduce((sum, d) => sum + d.orders, 0)}
                        valueStyle={{ fontSize: 18, color: '#f59e0b' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ background: '#f0fdf4', border: 'none' }}>
                      <Statistic 
                        title="TB/đơn hàng"
                        value={
                          revenueData.reduce((sum, d) => sum + d.orders, 0) > 0
                            ? revenueData.reduce((sum, d) => sum + d.revenue, 0) / 
                              revenueData.reduce((sum, d) => sum + d.orders, 0)
                            : 0
                        }
                        suffix="₫"
                        precision={0}
                        valueStyle={{ fontSize: 18, color: '#10b981' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <Empty description="Chưa có dữ liệu doanh thu" />
            )}
          </Card>
        </Col>

        {/* Status Pie Chart */}
        <Col xs={24} lg={8}>
          <Card title="Trạng thái đơn hàng">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Chưa có đơn hàng" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Đơn hàng gần đây</span>
                <Select 
                  value={recentOrdersLimit} 
                  onChange={setRecentOrdersLimit}
                  style={{ width: 120 }}
                >
                  <Option value={5}>5 đơn</Option>
                  <Option value={10}>10 đơn</Option>
                  <Option value={15}>15 đơn</Option>
                  <Option value={20}>20 đơn</Option>
                </Select>
              </div>
            }
          >
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Summary & New Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<RiseOutlined />}
              suffix="₫"
              valueStyle={{ color: '#667eea', fontSize: 28 }}
            />
            <div style={{ marginTop: 8 }}>
              {stats.revenueChange >= 0 ? (
                <Text type="success">
                  <ArrowUpOutlined /> {stats.revenueChange.toFixed(1)}% so với kỳ trước
                </Text>
              ) : (
                <Text type="danger">
                  <ArrowDownOutlined /> {Math.abs(stats.revenueChange).toFixed(1)}% so với kỳ trước
                </Text>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Tổng món ăn"
              value={stats.totalProducts}
              valueStyle={{ color: '#667eea', fontSize: 28 }}
            />
            <Text type="secondary">
              Giá trị TB/đơn: {stats.avgOrderValue?.toLocaleString('vi-VN')}₫
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Promotions & Delivery Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Promotions & Discounts */}
        <Col xs={24} lg={12}>
          <Card title={<><GiftOutlined /> Khuyến mãi & Giảm giá</>}>
            {stats.promotions ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Đơn có voucher"
                      value={stats.promotions.ordersWithVoucher || 0}
                      prefix={<TagOutlined />}
                      valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đơn có khuyến mãi"
                      value={stats.promotions.ordersWithPromotion || 0}
                      prefix={<GiftOutlined />}
                      valueStyle={{ color: '#eb2f96', fontSize: 20 }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">Tổng giảm giá</Text>
                      <br />
                      <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                        {stats.promotions.totalDiscount?.toLocaleString('vi-VN') || 0}₫
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">TB/đơn</Text>
                      <br />
                      <Text strong style={{ fontSize: 18 }}>
                        {stats.promotions.avgDiscount?.toLocaleString('vi-VN') || 0}₫
                      </Text>
                    </Col>
                  </Row>
                  {stats.totalOrders > 0 && (
                    <Progress
                      percent={Math.min(
                        ((stats.promotions.ordersWithVoucher + stats.promotions.ordersWithPromotion) / stats.totalOrders) * 100,
                        100
                      )}
                      strokeColor="#fa8c16"
                      style={{ marginTop: 12 }}
                      format={(percent) => `${percent.toFixed(0)}% đơn có ưu đãi`}
                    />
                  )}
                </div>
              </>
            ) : (
              <Empty description="Chưa có dữ liệu khuyến mãi" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* Delivery Statistics */}
        <Col xs={24} lg={12}>
          <Card title={<><CarOutlined /> Thông tin giao hàng</>}>
            {stats.delivery ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Khoảng cách TB"
                      value={stats.delivery.avgDistance}
                      suffix="km"
                      precision={2}
                      prefix={<EnvironmentOutlined />}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Thời gian TB"
                      value={stats.delivery.avgDuration}
                      suffix="phút"
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">Khoảng cách xa nhất</Text>
                      <br />
                      <Text strong style={{ fontSize: 16 }}>
                        {stats.delivery.maxDistance?.toFixed(1) || 0} km
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Phí giao TB</Text>
                      <br />
                      <Text strong style={{ fontSize: 16 }}>
                        {stats.delivery.avgDeliveryFee?.toLocaleString('vi-VN') || 0}₫
                      </Text>
                    </Col>
                  </Row>
                </div>
              </>
            ) : (
              <Empty description="Chưa có dữ liệu giao hàng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
