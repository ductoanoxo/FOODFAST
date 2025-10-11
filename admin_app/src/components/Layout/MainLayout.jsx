import { Outlet } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  RobotOutlined,
  LogoutOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { message } from 'antd';

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
    { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
    { key: '/restaurants', icon: <ShopOutlined />, label: 'Nhà hàng' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Đơn hàng' },
    { key: '/drones', icon: <RobotOutlined />, label: 'Drone' },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ Admin',
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
          <SafetyOutlined style={{ marginRight: 8 }} />
          ADMIN
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
          <h2 style={{ margin: 0, color: '#f5576c' }}>FoodFast Admin Panel</h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#f5576c' }} />
              <Text strong>{user?.name || 'Admin'}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
