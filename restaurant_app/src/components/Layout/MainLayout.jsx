import { Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  MenuOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  StarOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  GiftOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { message } from 'antd';
import NotificationCenter from '../NotificationCenter';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Đơn hàng' },
    { key: '/menu', icon: <MenuOutlined />, label: 'Thực đơn' },
    { key: '/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
    { key: '/vouchers', icon: <GiftOutlined />, label: 'Voucher' },
    { key: '/promotions', icon: <PercentageOutlined />, label: 'Khuyến mãi' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
    { key: '/reviews', icon: <StarOutlined />, label: 'Đánh giá' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
  ];

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt nhà hàng',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={250}>
        <div style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255,255,255,0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          fontSize: 20, 
          fontWeight: 'bold',
          borderRadius: 8
        }}>
          🍽️ Restaurant
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          defaultSelectedKeys={[window.location.pathname]}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0 }}>FoodFast Restaurant Dashboard</h2>
          <Space size="large">
            <NotificationCenter />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }} />
                <Text strong>{user?.name || 'Restaurant'}</Text>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
