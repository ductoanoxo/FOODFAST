import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import { login } from '../../api/authAPI'
import { loginSuccess } from '../../redux/slices/authSlice'

const { Title, Text } = Typography

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.auth)

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    const onFinish = async (values) => {
        setLoading(true)
        try {
            console.log('=== LOGIN DEBUG ===')
            console.log('Attempting login with:', values.email)
            const response = await login(values)
            console.log('Full response:', response)
            console.log('User data:', response?.user)
            console.log('User role:', response?.user?.role)
            
            const userRole = response?.user?.role || 'unknown'
            console.log('Checking role:', userRole, 'Expected: drone_operator or admin')
            
            // Check if user role is drone_operator or admin
            if (userRole !== 'drone_operator' && userRole !== 'admin') {
                console.error('❌ Access denied. User role:', userRole)
                toast.error(
                    `Bạn không có quyền truy cập Drone Management System.\nRole của bạn: "${userRole}"\nCần role: "drone_operator" hoặc "admin"`,
                    { autoClose: 5000 }
                )
                setLoading(false)
                return
            }

            console.log('✅ Role check passed, dispatching login success')
            dispatch(
                loginSuccess({
                    user: response.user,
                    token: response.token,
                })
            )

            toast.success(`Đăng nhập thành công! Xin chào ${response.user.name}`)
            navigate('/')
        } catch (error) {
            console.error('❌ Login error:', error)
            console.error('Error response:', error.response)
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error ||
                                error.message ||
                                'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    borderRadius: 12,
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                    {/* Logo and Title */}
                    <div>
                        <RocketOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                            DRONE MANAGEMENT
                        </Title>
                        <Text type="secondary">Hệ thống quản lý drone giao hàng</Text>
                    </div>

                    <Divider />

                    {/* Login Form */}
                    <Form layout="vertical" onFinish={onFinish} size="large">
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="dronemanager@example.com" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{ height: 45, fontSize: 16, fontWeight: 600 }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider />

                    {/* Demo Credentials */}
                    <div style={{ textAlign: 'left', background: '#f0f2f5', padding: 16, borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            🔑 Tài khoản demo:
                        </Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                            📧 Email: <Text copyable code>dronemanager@example.com</Text>
                        </Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                            🔒 Mật khẩu: <Text copyable code>123456</Text>
                        </Text>
                    </div>

                    {/* Footer */}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        © 2025 FOODFAST Drone Delivery System
                    </Text>
                </Space>
            </Card>
        </div>
    )
}

export default LoginPage
