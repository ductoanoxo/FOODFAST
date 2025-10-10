import { Card, Row, Col, Statistic } from 'antd'
import { UserOutlined, ShopOutlined, ShoppingOutlined, RobotOutlined } from '@ant-design/icons'

const DashboardPage = () => {
  return (
    <div>
      <h1>Tổng quan hệ thống</h1>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Người dùng" value={1250} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Nhà hàng" value={89} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đơn hàng" value={3456} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Drone" value={42} prefix={<RobotOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
