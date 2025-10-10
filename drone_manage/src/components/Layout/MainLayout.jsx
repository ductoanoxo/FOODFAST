import { Outlet } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  EnvironmentOutlined,
  RobotOutlined,
  AimOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Header, Content, Sider } = Layout

const MainLayout = () => {
  const navigate = useNavigate()

  const menuItems = [
    { key: '/', icon: <EnvironmentOutlined />, label: 'Bản đồ' },
    { key: '/drones', icon: <RobotOutlined />, label: 'Danh sách Drone' },
    { key: '/missions', icon: <AimOutlined />, label: 'Nhiệm vụ' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div style={{ height: 64, margin: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          🚁 DRONE
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <h2>FoodFast Drone Management</h2>
        </Header>
        <Content className="site-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
