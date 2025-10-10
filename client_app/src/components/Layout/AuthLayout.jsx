import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import './AuthLayout.css'

const { Content } = Layout

const AuthLayout = () => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <Outlet />
      </Content>
    </Layout>
  )
}

export default AuthLayout
