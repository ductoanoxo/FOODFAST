import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Layout, Menu, Dropdown, Avatar, Space, Typography } from 'antd'
import {
    EnvironmentOutlined,
    RobotOutlined,
    AimOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    RocketOutlined,
} from '@ant-design/icons'
import { logout } from '../../redux/slices/authSlice'
import { toast } from 'react-toastify'

const { Header, Content, Sider } = Layout
const { Text } = Typography

const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    const handleLogout = () => {
        dispatch(logout())
        toast.success('Đăng xuất thành công!')
        navigate('/login')
    }

    const menuItems = [
        { key: '/', icon: <EnvironmentOutlined />, label: 'Bản đồ' },
        { key: '/drones', icon: <RobotOutlined />, label: 'Danh sách Drone' },
        { key: '/missions', icon: <AimOutlined />, label: 'Nhiệm vụ' },
    ]

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => toast.info('Chức năng đang phát triển'),
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
            onClick: () => toast.info('Chức năng đang phát triển'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
            danger: true,
        },
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme="dark" breakpoint="lg" collapsedWidth="0">
                <div
                    style={{
                        height: 64,
                        margin: 16,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/')}
                >
                    <RocketOutlined style={{ marginRight: 8, fontSize: 24 }} />
                    DRONE
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <div>
                        <Text strong style={{ fontSize: 18 }}>
                            🍔 FOODFAST Drone Management
                        </Text>
                    </div>
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar
                                style={{ backgroundColor: '#1890ff' }}
                                icon={<UserOutlined />}
                                size="large"
                            />
                            <div style={{ textAlign: 'left' }}>
                                <Text strong style={{ display: 'block' }}>
                                    {user?.name || 'Drone Manager'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {user?.role === 'admin' ? 'Quản trị viên' : 'Điều hành viên'}
                                </Text>
                            </div>
                        </Space>
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout
