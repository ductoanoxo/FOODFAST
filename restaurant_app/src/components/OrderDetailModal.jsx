import { Modal, Descriptions, Typography, Tag, Divider, Timeline, Space } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
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
        <Title level={4} style={{ margin: 0 }}>
          Chi tiết đơn hàng #{order._id?.slice(-8).toUpperCase()}
        </Title>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Status */}
        <div>
          <Tag color={status.color} icon={status.icon} style={{ fontSize: 14, padding: '4px 12px' }}>
            {status.text}
          </Tag>
        </div>

        {/* Customer Info */}
        <div>
          <Title level={5}>Thông tin khách hàng</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
              {order.user?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
              {order.user?.phone || order.deliveryInfo?.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ giao hàng</>}>
              {order.deliveryInfo?.address || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Order Items */}
        <div>
          <Title level={5}>Chi tiết món ăn</Title>
          {order.items?.map((item, index) => {
            // Prefer stored originalPrice; fallback to product.price
            const originalUnit = item.originalPrice ?? item.product?.price ?? 0;
            const discountedUnit = item.price ?? originalUnit;
            const qty = item.quantity || 0;
            const lineTotal = discountedUnit * qty;
            const itemDiscountAmount = (item.appliedDiscount?.amount || 0) * qty;

            return (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text strong>{item.product?.name || 'Sản phẩm'}</Text>
                  <br />
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary">Giá gốc mỗi phần: </Text>
                    <Text>{originalUnit.toLocaleString('vi-VN')}₫</Text>
                    <Text style={{ marginLeft: 12 }} type="secondary">Số lượng: </Text>
                    <Text strong>{qty}</Text>
                  </div>

                  {discountedUnit !== originalUnit && (
                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary">Giá sau giảm mỗi phần: </Text>
                      <Text strong style={{ color: '#ff4d4f' }}>{discountedUnit.toLocaleString('vi-VN')}₫</Text>
                    </div>
                  )}

                  {/* Per-item promotion snapshot */}
                  {item.appliedPromotion && (
                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary">Khuyến mãi: </Text>
                      <Tag color="green">{item.appliedPromotion.name} ({item.appliedPromotion.discountPercent}%)</Tag>
                    </div>
                  )}

                  {/* Per-item discount amount */}
                  {itemDiscountAmount > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary">Giảm cho mục này: </Text>
                      <Text type="danger">-{itemDiscountAmount.toLocaleString('vi-VN')}₫</Text>
                    </div>
                  )}
                </div>
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
              </div>
            );
          })}
        </div>

        <Divider />

        {/* Payment Info */}
        <div>
          <Title level={5}>Thông tin thanh toán</Title>
          <div style={{ 
            background: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Tổng tiền hàng:</Text>
              <Text>{(order.subtotal ?? 0).toLocaleString('vi-VN')}₫</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Phí vận chuyển:</Text>
              <Text>{order.deliveryFee?.toLocaleString('vi-VN') || '0'}₫</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
              <Text strong style={{ fontSize: 18, color: '#667eea' }}>
                <DollarOutlined /> {(order.totalAmount ?? ((order.subtotal ?? 0) + (order.deliveryFee ?? 0))).toLocaleString('vi-VN')}₫
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Phương thức: {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
              </Text>
            </div>
            {/* Show applied voucher and promotions */}
            {order.appliedVoucher && (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Voucher khách dùng:</Text>
                <br />
                <Text strong>{order.appliedVoucher.name || order.appliedVoucher.code} - Giảm {(order.appliedVoucher.discountAmount || 0).toLocaleString('vi-VN')}₫</Text>
              </div>
            )}
            {order.appliedPromotions && order.appliedPromotions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Khuyến mãi áp dụng:</Text>
                <div style={{ marginTop: 6 }}>
                  {order.appliedPromotions.map((p) => (
                    <Tag key={p.id} color="blue">{p.name} ({p.discountPercent}%)</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* Timeline */}
        <div>
          <Title level={5}>Lịch sử đơn hàng</Title>
          <Timeline
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
        </div>

        {/* Notes */}
        {order.notes && (
          <>
            <Divider />
            <div>
              <Title level={5}>Ghi chú</Title>
              <Text>{order.notes}</Text>
            </div>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default OrderDetailModal;
