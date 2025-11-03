import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Typography,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import dayjs from 'dayjs';
import { getRestaurantStats, getRevenueReport, getTopProducts } from '../../api/restaurantAPI';
import './ReportsPage.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [period, setPeriod] = useState('day'); // day, week, month
  
  // State cho data từ API
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    revenueChange: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);

  useEffect(() => {
    loadData();
  }, [dateRange, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        period,
      };

      // Gọi API song song
      const [statsRes, revenueRes, topProductsRes] = await Promise.all([
        getRestaurantStats(params),
        getRevenueReport(params),
        getTopProducts({ ...params, limit: 5 }),
      ]);

      // Cập nhật stats
      if (statsRes?.data) {
        setStats({
          totalRevenue: statsRes.data.totalRevenue || 0,
          totalOrders: statsRes.data.totalOrders || 0,
          avgOrderValue: statsRes.data.avgOrderValue || 0,
          revenueChange: statsRes.data.revenueChange || 0,
        });
        
        // Chuyển đổi ordersByStatus cho PieChart
        if (statsRes.data.ordersByStatus) {
          const statusData = Object.entries(statsRes.data.ordersByStatus).map(([status, value]) => ({
            name: getStatusLabel(status),
            value,
          }));
          setOrdersByStatus(statusData);
        }
      }

      // Cập nhật revenue chart data
      if (revenueRes?.data) {
        setRevenueData(revenueRes.data.map(item => ({
          date: item.date,
          revenue: item.revenue,
          orders: item.orders || 0,
        })));
      }

      // Cập nhật top products
      if (topProductsRes?.data) {
        setTopProducts(topProductsRes.data);
      }

    } catch (error) {
      message.error('Không thể tải báo cáo: ' + error);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      delivering: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  // Custom tooltip for revenue chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ fontWeight: 600, marginBottom: 8 }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              <strong>{entry.name}:</strong>{' '}
              {entry.name.includes('Doanh thu') || entry.name.includes('Giá trị')
                ? `${entry.value.toLocaleString('vi-VN')}₫`
                : entry.value.toLocaleString('vi-VN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleDateChange = (dates) => {
    // Normalize incoming values to dayjs objects so the rest of the
    // component (which uses dayjs) always receives a consistent type.
    if (dates && dates[0] && dates[1]) {
      setDateRange([dayjs(dates[0]), dayjs(dates[1])]);
    } else {
      // If cleared, reset to default last 30 days
      setDateRange([dayjs().subtract(30, 'days'), dayjs()]);
    }
  };

  const formatRange = () => {
    try {
      if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
        return `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`;
      }
    } catch (e) {
      // fallback
    }
    return '';
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <Title level={2}>Báo cáo & Thống kê</Title>
          <Text type="secondary">
            Phân tích doanh thu và hiệu suất kinh doanh
          </Text>
        </div>
        <Space>
          <RangePicker
            // Ensure RangePicker always receives dayjs objects (antd may
            // sometimes provide other libs depending on config). We map
            // defensively in case dateRange items are not dayjs already.
            value={dateRange && dateRange.length === 2 ? dateRange.map(d => dayjs(d)) : undefined}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            allowClear
          />
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
          >
            <Select.Option value="day">Theo ngày</Select.Option>
            <Select.Option value="week">Theo tuần</Select.Option>
            <Select.Option value="month">Theo tháng</Select.Option>
          </Select>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={stats.totalRevenue}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix="₫"
                  valueStyle={{ color: '#3f8600' }}
                />
                <div style={{ marginTop: 8 }}>
                  {stats.revenueChange > 0 ? (
                    <Text type="success">
                      <RiseOutlined /> +{stats.revenueChange}% so với kỳ trước
                    </Text>
                  ) : (
                    <Text type="danger">
                      <FallOutlined /> {stats.revenueChange}% so với kỳ trước
                    </Text>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={stats.totalOrders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Giá trị TB/đơn"
                  value={stats.avgOrderValue}
                  precision={0}
                  suffix="₫"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={
                    stats.totalOrders > 0
                      ? ((stats.totalOrders - (ordersByStatus.find(o => o.name === 'Đã hủy')?.value || 0)) / stats.totalOrders * 100)
                      : 0
                  }
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Revenue Chart */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <div>
                    <div>Biểu đồ doanh thu & Đơn hàng</div>
                    <div style={{ fontSize: 12 }}>
                      <Text type="secondary">Khoảng: {formatRange()}</Text>
                    </div>
                  </div>
                }
              >
                {revenueData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          label={{ value: 'Doanh thu (₫)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Số đơn hàng', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {/* Area for Revenue */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          name="Doanh thu"
                          fill="url(#colorRevenue)"
                          stroke="#667eea"
                          strokeWidth={3}
                        />
                        
                        {/* Bar for Orders */}
                        <Bar
                          yAxisId="right"
                          dataKey="orders"
                          name="Số đơn hàng"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                        />
                        
                        {/* Line for trend */}
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          name="Xu hướng doanh thu"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    
                    {/* Revenue Summary Cards */}
                    <Row gutter={16} style={{ marginTop: 20 }}>
                      <Col span={8}>
                        <Card size="small" style={{ background: '#f0f5ff', border: 'none', textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Doanh thu cao nhất</Text>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#667eea', marginTop: 4 }}>
                            {Math.max(...revenueData.map(d => d.revenue)).toLocaleString('vi-VN')}₫
                          </div>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" style={{ background: '#f0fdf4', border: 'none', textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Trung bình/ngày</Text>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981', marginTop: 4 }}>
                            {(revenueData.reduce((sum, d) => sum + d.revenue, 0) / revenueData.length).toFixed(0).toLocaleString('vi-VN')}₫
                          </div>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" style={{ background: '#fff7e6', border: 'none', textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Đơn hàng cao nhất</Text>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#f59e0b', marginTop: 4 }}>
                            {Math.max(...revenueData.map(d => d.orders))} đơn
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Empty
                    description={
                      <div>
                        <div>Chưa có dữ liệu doanh thu</div>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">Khoảng: {formatRange()}</Text>
                        </div>
                      </div>
                    }
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div>
                    <div>Trạng thái đơn hàng</div>
                    <div style={{ fontSize: 12 }}>
                      <Text type="secondary">Khoảng: {formatRange()}</Text>
                    </div>
                  </div>
                }
              >
                {ordersByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ordersByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty
                    description={
                      <div>
                        <div>Chưa có đơn hàng</div>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">Khoảng: {formatRange()}</Text>
                        </div>
                      </div>
                    }
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Top Products */}
          <Card
            title={
              <div>
                <div>Top 5 Món ăn bán chạy nhất</div>
                <div style={{ fontSize: 12 }}>
                  <Text type="secondary">Khoảng: {formatRange()}</Text>
                </div>
              </div>
            }
          >
            {topProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topProducts} layout="vertical">
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="colorProductRevenue" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f5576c" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="custom-tooltip">
                              <p className="label" style={{ fontWeight: 600, marginBottom: 8 }}>
                                {payload[0].payload.name}
                              </p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
                                  <strong>{entry.name}:</strong>{' '}
                                  {entry.name === 'Doanh thu'
                                    ? `${entry.value.toLocaleString('vi-VN')}₫`
                                    : `${entry.value} món`}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="sales" 
                      fill="url(#colorSales)" 
                      name="Số lượng bán"
                      radius={[0, 8, 8, 0]}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="url(#colorProductRevenue)" 
                      name="Doanh thu"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Top Product Summary */}
                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col span={12}>
                    <Card size="small" style={{ background: '#f0f5ff', border: 'none', textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tổng SP đã bán</Text>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#667eea', marginTop: 4 }}>
                        {topProducts.reduce((sum, p) => sum + (p.sales || 0), 0)} món
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ background: '#fff0f6', border: 'none', textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Doanh thu từ Top 5</Text>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#f5576c', marginTop: 4 }}>
                        {topProducts.reduce((sum, p) => sum + (p.revenue || 0), 0).toLocaleString('vi-VN')}₫
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <Empty
                description={
                  <div>
                    <div>Chưa có món bán chạy</div>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Khoảng: {formatRange()}</Text>
                    </div>
                  </div>
                }
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;