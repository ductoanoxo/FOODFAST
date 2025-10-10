import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './Header'
import Footer from './Footer'

const { Content } = Layout

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ marginTop: 64 }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  )
}

export default MainLayout
