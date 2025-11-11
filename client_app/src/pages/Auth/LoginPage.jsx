import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider,
  Space,
  message 
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  GoogleOutlined, 
  FacebookOutlined 
} from '@ant-design/icons'
import { loginSuccess, loginStart, loginFailure } from '../../redux/slices/authSlice'
import { authAPI } from '../../api/authAPI'
import './LoginPage.css'

const { Title, Text, Link } = Typography

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, isAuthenticated } = useSelector((state) => state.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const onFinish = async (values) => {
    try {
      dispatch(loginStart())
      const response = await authAPI.login(values)
      
      console.log('Login response:', response) // Debug log
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token
      }))
      
      message.success('Đăng nhập thành công!')
      navigate('/')
    } catch (error) {
      dispatch(loginFailure(error.message || 'Đăng nhập thất bại'))
      message.error(error.message || 'Email hoặc mật khẩu không đúng!')
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <img src="https://res.cloudinary.com/dp4o6la8b/image/upload/v1761115010/logo.jpg" alt="FoodFast" className="login-logo" />
          <Title level={2}>Đăng nhập</Title>
          <Text type="secondary">Chào mừng bạn quay lại!</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <div className="login-options">
              <Text>
                <Link onClick={() => navigate('/forgot-password')}>
                  Quên mật khẩu?
                </Link>
              </Text>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              size="large"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>Hoặc đăng nhập với</Divider>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button 
            icon={<GoogleOutlined />} 
            block 
            size="large"
            className="social-btn google-btn"
          >
            Đăng nhập với Google
          </Button>
          <Button 
            icon={<FacebookOutlined />} 
            block 
            size="large"
            className="social-btn facebook-btn"
          >
            Đăng nhập với Facebook
          </Button>
        </Space>

        <div className="login-footer">
          <Text>
            Chưa có tài khoản?{' '}
            <Link onClick={() => navigate('/register')}>
              <strong>Đăng ký ngay</strong>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
