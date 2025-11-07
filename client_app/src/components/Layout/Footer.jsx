import { Layout, Row, Col, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import './Footer.css'

const { Footer: AntFooter } = Layout
const { Title, Text } = Typography

const Footer = () => {
  return (
    <AntFooter className="site-footer">
      <div className="footer-container">
        <Row gutter={[32, 32]}>
          {/* About */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>
              Về FoodFast 
            </Title>
            <Space direction="vertical" size="small">
              <Link to="/about">Giới thiệu</Link>
              <Link to="/terms">Điều khoản sử dụng</Link>
              <Link to="/privacy">Chính sách bảo mật</Link>
              <Link to="/faq">Câu hỏi thường gặp</Link>
            </Space>
          </Col>

          {/* For Partners */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>
              Đối tác
            </Title>
            <Space direction="vertical" size="small">
              <Link to="/partner/register">Đăng ký nhà hàng</Link>
              <Link to="/partner/login">Đăng nhập nhà hàng</Link>
              <Link to="/driver">Trở thành tài xế</Link>
              <Link to="/affiliate">Chương trình liên kết</Link>
            </Space>
          </Col>

          {/* Support */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>
              Hỗ trợ
            </Title>
            <Space direction="vertical" size="small">
              <Link to="/help">Trung tâm hỗ trợ</Link>
              <Link to="/contact">Liên hệ</Link>
              <Link to="/feedback">Góp ý</Link>
              <Link to="/careers">Tuyển dụng</Link>
            </Space>
          </Col>

          {/* Contact */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>
              Liên hệ
            </Title>
            <Space direction="vertical" size="small">
              <div>
                <PhoneOutlined /> <span>1900 1234</span>
              </div>
              <div>
                <MailOutlined /> <span>support@foodfast.vn</span>
              </div>
              <div>
                <EnvironmentOutlined /> <span>123 Lê Lợi, Q.1, TP.HCM</span>
              </div>
            </Space>
            
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FacebookOutlined />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <InstagramOutlined />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterOutlined />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <YoutubeOutlined />
              </a>
            </div>
          </Col>
        </Row>

        <div className="footer-bottom">
          <Text style={{ color: '#ccc' }}>
            © 2025 FoodFast. All rights reserved. Powered by Drone Technology 🚁
          </Text>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer
