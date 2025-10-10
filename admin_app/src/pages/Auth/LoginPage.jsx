import { Card, Form, Input, Button } from 'antd'

const LoginPage = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title="Admin Login" style={{ width: 400 }}>
        <Form layout="vertical">
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block danger>
            Đăng nhập Admin
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
