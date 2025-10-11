import { useState, useEffect } from 'react'
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
  message,
  Checkbox
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined, 
  FacebookOutlined 
} from '@ant-design/icons'
import { loginSuccess, loginStart, loginFailure } from '../../redux/slices/authSlice'
import { authAPI } from '../../api/authAPI'
import './RegisterPage.css'

const { Title, Text, Link } = Typography

const RegisterPage = () => {
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
      const response = await authAPI.register(values)
      
      console.log('Register response:', response) // Debug log
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token
      }))
      
      message.success('Đăng ký thành công!')
      navigate('/')
    } catch (error) {
      dispatch(loginFailure(error.message || 'Đăng ký thất bại'))
      message.error(error.message || 'Đăng ký thất bại!')
    }
  }

  return (
    <div className="register-page">
      <Card className="register-card">
        <div className="register-header">
          <img src="http://localhost:5000/uploads/logo.jpg" alt="FoodFast" className="register-logo" />
          <Title level={2}>Đăng ký</Title>
          <Text type="secondary">Tạo tài khoản mới để bắt đầu</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên!' },
              { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Họ và tên" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Số điện thoại" 
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với điều khoản')),
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý với <Link>Điều khoản sử dụng</Link> và <Link>Chính sách bảo mật</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              size="large"
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>Hoặc đăng ký với</Divider>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button 
            icon={<GoogleOutlined />} 
            block 
            size="large"
            className="social-btn google-btn"
          >
            Đăng ký với Google
          </Button>
          <Button 
            icon={<FacebookOutlined />} 
            block 
            size="large"
            className="social-btn facebook-btn"
          >
            Đăng ký với Facebook
          </Button>
        </Space>

        <div className="register-footer">
          <Text>
            Đã có tài khoản?{' '}
            <Link onClick={() => navigate('/login')}>
              <strong>Đăng nhập ngay</strong>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default RegisterPage
