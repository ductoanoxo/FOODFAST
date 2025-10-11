import { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../redux/slices/authSlice';
import { login } from '../../api/authAPI';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const data = await login(values);
      
      // Check if user is admin
      if (data.user.role !== 'admin') {
        message.error('Bạn không có quyền truy cập hệ thống quản trị!');
        return;
      }

      dispatch(loginSuccess({
        user: data.user,
        token: data.token,
      }));

      message.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          borderRadius: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <SafetyOutlined style={{ fontSize: 48, color: '#f5576c', marginBottom: 10 }} />
          <Title level={2} style={{ marginBottom: 5, color: '#f5576c' }}>Admin Portal</Title>
          <Text type="secondary">Hệ thống quản trị FOODFAST</Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item 
            label="Email" 
            name="email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="admin@foodfast.com"
              size="large"
            />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu" 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
              danger
            >
              Đăng nhập Admin
            </Button>
          </Form.Item>
        </Form>

                            {/* Demo Credentials */}
                    <div style={{ textAlign: 'left', background: '#f0f2f5', padding: 16, borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            🔑 Tài khoản demo:
                        </Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                            📧 Email: <Text copyable code>admin@foodfast.com</Text>
                        </Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                            🔒 Mật khẩu: <Text copyable code>admin123</Text>
                        </Text>
                    </div>

                    {/* Footer */}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        © 2025 FOODFAST Drone Delivery System
                    </Text>
      </Card>
    </div>
  );
};

export default LoginPage;
