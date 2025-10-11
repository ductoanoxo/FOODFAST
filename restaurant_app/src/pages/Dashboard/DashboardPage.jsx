import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Statistic, Typography, Spin, Empty, Table } from 'antd';
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { fetchOrders } from '../../redux/slices/orderSlice';
import { fetchProducts } from '../../redux/slices/productSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import './DashboardPage.css';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { orders, stats, loading: ordersLoading } = useSelector((state) => state.orders);
  const { products, loading: productsLoading } = useSelector((state) => state.products);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0) {
      // Calculate revenue by day (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        const dayOrders = orders.filter(
          (order) =>
            dayjs(order.createdAt).format('YYYY-MM-DD') === date.format('YYYY-MM-DD') &&
            order.status === 'completed'
        );
        const revenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        last7Days.push({
          date: date.format('DD/MM'),
          revenue: revenue,
          orders: dayOrders.length,
        });
      }
      setRevenueData(last7Days);
    }
  }, [orders]);

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const todayRevenue = orders
    .filter(
      (o) =>
        o.status === 'completed' &&
        dayjs(o.createdAt).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    )
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const statusColors = {
    pending: '#faad14',
    preparing: '#1890ff',
    delivering: '#722ed1',
    completed: '#52c41a',
  };

  const pieData = [
    { name: 'Chờ xác nhận', value: stats.pending, color: statusColors.pending },
    { name: 'Đang chuẩn bị', value: stats.preparing, color: statusColors.preparing },
    { name: 'Đang giao', value: stats.delivering, color: statusColors.delivering },
    { name: 'Hoàn thành', value: stats.completed, color: statusColors.completed },
  ].filter(item => item.value > 0);

  const recentOrders = orders.slice(0, 5);

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

  if (ordersLoading || productsLoading) {
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
              value={stats.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.pending + stats.preparing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={todayRevenue}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Revenue Chart */}
        <Col xs={24} lg={14}>
          <Card title="Doanh thu 7 ngày qua">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString('vi-VN')}₫`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>

        {/* Status Pie Chart */}
        <Col xs={24} lg={10}>
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
          <Card title="Đơn hàng gần đây">
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Summary */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              prefix={<RiseOutlined />}
              suffix="₫"
              valueStyle={{ color: '#667eea', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Tổng món ăn"
              value={products.length}
              valueStyle={{ color: '#667eea', fontSize: 28 }}
            />
            <Text type="secondary">
              Còn hàng: {products.filter((p) => p.available).length}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
