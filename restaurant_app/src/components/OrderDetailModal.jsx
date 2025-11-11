import { Modal, Descriptions, Typography, Tag, Divider, Timeline, Space, Row, Col, Card, List, Alert } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  WarningOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const statusConfig = {
  pending: { color: 'orange', text: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
  preparing: { color: 'blue', text: 'Đang chuẩn bị', icon: <SyncOutlined spin /> },
  ready: { color: 'cyan', text: 'Sẵn sàng giao', icon: <CheckCircleOutlined /> },
  delivering: { color: 'purple', text: 'Đang giao', icon: <SyncOutlined spin /> },
  completed: { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  delivered: { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  cancelled: { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
};

const OrderDetailModal = ({ visible, order, onClose }) => {
  if (!order) return null;

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết đơn hàng {order.orderNumber ? `#${order.orderNumber}` : `#${order._id?.slice(-8).toUpperCase()}`}
          </Title>
          {/* show internal id as small secondary text */}
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
            ID nội bộ: {order._id}
          </Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      bodyStyle={{ background: '#f5f5f5', paddingTop: 16, paddingBottom: 16 }}
    >
      <Row gutter={16}>
        {/* Left Column */}
        <Col span={14}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Order Items */}
            <Card size="small" title="Chi tiết món ăn">
              <List
                dataSource={order.items}
                renderItem={(item) => {
                  const originalUnit = item.originalPrice ?? item.product?.price ?? 0;
                  const discountedUnit = item.price ?? originalUnit;
                  const qty = item.quantity || 0;
                  const lineTotal = discountedUnit * qty;
                  const itemDiscountAmount = (item.appliedDiscount?.amount || 0) * qty;

                  return (
                    <List.Item
                      key={item.product?._id || item._id}
                      extra={
                        <div style={{ textAlign: 'right' }}>
                          {itemDiscountAmount > 0 && (
                            <Text type="secondary" delete style={{ fontSize: 12, display: 'block' }}>
                              {(originalUnit * qty).toLocaleString('vi-VN')}₫
                            </Text>
                          )}
                          <Text strong style={{ color: itemDiscountAmount > 0 ? '#ff4d4f' : 'inherit' }}>
                            {lineTotal.toLocaleString('vi-VN')}₫
                          </Text>
                        </div>
                      }
                    >
                      <List.Item.Meta
                        title={<Text strong>{item.product?.name || 'Sản phẩm'}</Text>}
                        description={
                          <>
                            <div style={{ marginTop: 4 }}>
                                <Text type="secondary">Giá gốc: </Text>
                                <Text>{originalUnit.toLocaleString('vi-VN')}₫</Text>
                                <Text style={{ marginLeft: 12 }} type="secondary">Số lượng: </Text>
                                <Text strong>{qty}</Text>
                            </div>

                            {discountedUnit !== originalUnit && (
                                <div style={{ marginTop: 4 }}>
                                <Text type="secondary">Giá sau giảm: </Text>
                                <Text strong style={{ color: '#ff4d4f' }}>{discountedUnit.toLocaleString('vi-VN')}₫</Text>
                                </div>
                            )}

                            {item.appliedPromotion && (
                                <div style={{ marginTop: 4 }}>
                                    <Tag color="green" style={{ fontSize: 11 }}>
                                        {item.appliedPromotion.name} ({item.appliedPromotion.discountPercent}%)
                                    </Tag>
                                </div>
                            )}

                            {itemDiscountAmount > 0 && (
                                <div style={{ marginTop: 4 }}>
                                    <Text type="secondary">Giảm cho mục này: </Text>
                                    <Text type="danger">-{itemDiscountAmount.toLocaleString('vi-VN')}₫</Text>
                                </div>
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>

            {/* Payment Info */}
            <Card size="small" title="Thông tin thanh toán">
              <div style={{ marginBottom: 8 }}>
                <Text strong>Trạng thái:&nbsp;</Text>
                <Tag color={
                  order.paymentStatus === 'paid' ? 'green' : 
                  order.paymentStatus === 'failed' ? 'red' : 
                  order.paymentStatus === 'refunded' ? 'blue' : 
                  order.paymentStatus === 'refund_pending' ? 'orange' : 
                  'default'
                }>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                   order.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                   order.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                   order.paymentStatus === 'refund_pending' ? 'Đang hoàn tiền' : 
                   order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                   'Đang chờ thanh toán online'}
                </Tag>
              </div>
              
              {/* Hiển thị lỗi thanh toán nếu có */}
              {order.paymentStatus === 'failed' && order.paymentInfo?.errorMessage && (
                <Alert
                  message="Thanh toán thất bại"
                  description={
                    <div>
                      <p style={{ marginBottom: 4 }}><strong>Mã lỗi:</strong> {order.paymentInfo.errorCode}</p>
                      <p style={{ marginBottom: 0 }}><strong>Chi tiết:</strong> {order.paymentInfo.errorMessage}</p>
                      {order.paymentInfo.failedAt && (
                        <p style={{ marginTop: 8, marginBottom: 0 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Thời gian: {dayjs(order.paymentInfo.failedAt).format('DD/MM/YYYY HH:mm:ss')}
                          </Text>
                        </p>
                      )}
                    </div>
                  }
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: 12 }}
                />
              )}
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                  <Text>Tổng tiền hàng:</Text>
                  <Text>{(order.subtotal ?? 0).toLocaleString('vi-VN')}₫</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                  <Text>Phí vận chuyển:</Text>
                  <Text>{order.deliveryFee?.toLocaleString('vi-VN') || '0'}₫</Text>
                </div>
                {order.appliedVoucher && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4f'}}>
                        <Text type="danger">Voucher ({order.appliedVoucher.code}):</Text>
                        <Text type="danger">-{(order.appliedVoucher.discountAmount || 0).toLocaleString('vi-VN')}₫</Text>
                    </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                    <DollarOutlined /> {(order.totalAmount ?? 0).toLocaleString('vi-VN')}₫
                  </Text>
                </div>
              </Space>
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary" style={{ display: 'block', marginBottom: 8}}>
                Phương thức: {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
              </Text>
              {order.appliedPromotions && order.appliedPromotions.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Khuyến mãi áp dụng:</Text>
                    <div style={{ marginTop: 4 }}>
                    {order.appliedPromotions.map((p) => (
                        <Tag key={p.id} color="blue">{p.name} ({p.discountPercent}%)</Tag>
                    ))}
                    </div>
                </div>
                )}
            </Card>

            {order.status === 'cancelled' && order.cancelReason && (
                <Card size="small" title="Thông tin hủy đơn">
                    <Text strong type="danger">Lý do hủy:</Text>
                    <br />
                    <Text>{order.cancelReason}</Text>
                    {order.cancelledAt && (
                    <div style={{ marginTop: 6 }}>
                        <Text type="secondary">Thời gian hủy: {dayjs(order.cancelledAt).format('DD/MM/YYYY HH:mm')}</Text>
                    </div>
                    )}
                </Card>
            )}
          </Space>
        </Col>

        {/* Right Column */}
        <Col span={10}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small">
                <div style={{ textAlign: 'center' }}>
                    <Text>Trạng thái đơn hàng</Text>
                    <br />
                    <Tag color={status.color} icon={status.icon} style={{ fontSize: 16, padding: '6px 14px', marginTop: 8 }}>
                        {status.text}
                    </Tag>
                </div>
            </Card>

            <Card size="small" title="Thông tin khách hàng">
              <Descriptions column={1} size="small" labelStyle={{ width: 120 }}>
                <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
                  {order.user?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> SĐT</>}>
                  {order.user?.phone || order.deliveryInfo?.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                  {order.deliveryInfo?.address || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {order.note && (
                <Card size="small" title={<><MessageOutlined style={{ marginRight: 8 }} />Ghi chú của khách</>}>
                    <Text>{order.note}</Text>
                </Card>
            )}

            {order.distanceKm != null && (
              <Card size="small" title="Thông tin vận chuyển">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Khoảng cách">
                    {order.distanceKm} km
                  </Descriptions.Item>
                  {order.distanceExplanation && (
                    <Descriptions.Item label="Cách tính">
                      <Text style={{ fontSize: 12 }}>{order.distanceExplanation}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {order.drone && (
              <Card size="small" title="Thông tin Drone 🚁">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên drone">
                    {order.drone.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Model">
                    {order.drone.model || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={order.drone.status === 'available' ? 'green' : 'orange'}>
                      {order.drone.status === 'available' ? 'Sẵn sàng' : 'Đang bận'}
                    </Tag>
                  </Descriptions.Item>
                  {order.drone.batteryLevel && (
                    <Descriptions.Item label="Pin">
                      <Text style={{ color: order.drone.batteryLevel > 50 ? '#52c41a' : '#ff4d4f' }}>
                        🔋 {order.drone.batteryLevel}%
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {!order.drone && order.status === 'ready' && (
                <div style={{ 
                background: '#fff7e6', 
                border: '1px solid #ffd591',
                borderRadius: '8px',
                padding: '12px 16px',
                textAlign: 'center'
                }}>
                <Text style={{ color: '#fa8c16', fontSize: '14px' }}>
                    ⚠️ Đơn hàng đã sẵn sàng nhưng chưa có drone được phân công. Vui lòng chờ admin phân công drone.
                </Text>
                </div>
            )}

            <Card size="small" title="Lịch sử đơn hàng">
              <Timeline
                style={{ marginTop: 16 }}
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <Text strong>Đơn hàng được tạo</Text>
                        <br />
                        <Text type="secondary">{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                      </>
                    ),
                  },
                  order.status !== 'pending' && {
                    color: 'blue',
                    children: (
                      <>
                        <Text strong>Đang xử lý</Text>
                        <br />
                        <Text type="secondary">{dayjs(order.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                      </>
                    ),
                  },
                  (order.status === 'completed' || order.status === 'cancelled') && {
                    color: order.status === 'completed' ? 'green' : 'red',
                    children: (
                      <>
                        <Text strong>{order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}</Text>
                        <br />
                        <Text type="secondary">{dayjs(order.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                      </>
                    ),
                  },
                ].filter(Boolean)}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default OrderDetailModal;