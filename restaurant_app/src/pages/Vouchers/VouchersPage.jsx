import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Radio,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  TagOutlined,
  GiftOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getVoucherStats,
} from '../../api/voucherAPI'
import './VouchersPage.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [statsModalVisible, setStatsModalVisible] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [voucherStats, setVoucherStats] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadVouchers()
  }, [])

  const loadVouchers = async () => {
    try {
      setLoading(true)
      const response = await getVouchers()
      setVouchers(response.data || [])
    } catch (error) {
      message.error('Không thể tải danh sách voucher')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingVoucher(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher)
    form.setFieldsValue({
      ...voucher,
      dateRange: [dayjs(voucher.validFrom), dayjs(voucher.validUntil)],
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id)
      message.success('Xóa voucher thành công')
      loadVouchers()
    } catch (error) {
      message.error('Không thể xóa voucher')
      console.error(error)
    }
  }

  const handleViewStats = async (voucher) => {
    try {
      const response = await getVoucherStats(voucher._id)
      setVoucherStats(response.data)
      setStatsModalVisible(true)
    } catch (error) {
      message.error('Không thể tải thống kê')
      console.error(error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const voucherData = {
        ...values,
        validFrom: values.dateRange[0].toISOString(),
        validUntil: values.dateRange[1].toISOString(),
      }
      delete voucherData.dateRange

      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, voucherData)
        message.success('Cập nhật voucher thành công')
      } else {
        await createVoucher(voucherData)
        message.success('Tạo voucher thành công')
      }

      setModalVisible(false)
      loadVouchers()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      console.error(error)
    }
  }

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      render: (_, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          {record.discountType === 'percentage'
            ? `${record.discountValue}%`
            : `${record.discountValue.toLocaleString('vi-VN')}đ`}
        </Text>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrder',
      key: 'minOrder',
      render: (value) => `${value.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Số lượng',
      key: 'usage',
      render: (_, record) => (
        <Text>
          {record.usageCount} / {record.maxUsage || '∞'}
        </Text>
      ),
    },
    {
      title: 'Thời gian',
      key: 'validity',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.validFrom).format('DD/MM/YYYY')}</div>
          <div>→ {dayjs(record.validUntil).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => {
        const now = new Date()
        const isValid = isActive && 
                       new Date(record.validFrom) <= now && 
                       new Date(record.validUntil) >= now &&
                       (record.maxUsage === null || record.usageCount < record.maxUsage)
        
        return (
          <Tag color={isValid ? 'green' : 'red'}>
            {isValid ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewStats(record)}
          >
            Thống kê
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa voucher?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const activeVouchers = vouchers.filter((v) => {
    const now = new Date()
    return v.isActive && 
           new Date(v.validFrom) <= now && 
           new Date(v.validUntil) >= now
  })

  const totalUsage = vouchers.reduce((sum, v) => sum + v.usageCount, 0)

  return (
    <div className="vouchers-page">
      <div className="vouchers-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <GiftOutlined /> Quản lý Voucher
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo Voucher
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={16} className="vouchers-stats">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số Voucher"
              value={vouchers.length}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeVouchers.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Lượt sử dụng"
              value={totalUsage}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={vouchers}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} voucher`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingVoucher ? 'Sửa Voucher' : 'Tạo Voucher Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            discountType: 'percentage',
            userRestriction: 'all',
            minOrder: 0,
            isActive: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã Voucher"
                name="code"
                rules={[{ required: true, message: 'Vui lòng nhập mã!' }]}
              >
                <Input
                  placeholder="VD: DISCOUNT20"
                  disabled={!!editingVoucher}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên Voucher"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input placeholder="VD: Giảm 20% cho đơn đầu tiên" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết về voucher" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="percentage">Phần trăm (%)</Radio>
                  <Radio value="fixed">Số tiền cố định</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.discountType !== curr.discountType}
              >
                {({ getFieldValue }) => {
                  const type = getFieldValue('discountType')
                  return (
                    <Form.Item
                      label="Giá trị giảm"
                      name="discountValue"
                      rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={type === 'percentage' ? 100 : undefined}
                        formatter={(value) =>
                          type === 'percentage' ? `${value}%` : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={(value) => value.replace(/[%,]/g, '')}
                      />
                    </Form.Item>
                  )
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.discountType !== curr.discountType}
              >
                {({ getFieldValue }) =>
                  getFieldValue('discountType') === 'percentage' && (
                    <Form.Item label="Giảm tối đa (VNĐ)" name="maxDiscount">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/,/g, '')}
                        placeholder="Không giới hạn"
                      />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đơn hàng tối thiểu (VNĐ)" name="minOrder">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/,/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số lượng tối đa" name="maxUsage">
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Không giới hạn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đối tượng áp dụng" name="userRestriction">
                <Select>
                  <Select.Option value="all">Tất cả</Select.Option>
                  <Select.Option value="new">Khách hàng mới</Select.Option>
                  <Select.Option value="existing">Khách hàng cũ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Thời gian hiệu lực"
            name="dateRange"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          {editingVoucher && (
            <Form.Item label="Trạng thái" name="isActive">
              <Radio.Group>
                <Radio value={true}>Hoạt động</Radio>
                <Radio value={false}>Tạm dừng</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stats Modal */}
      <Modal
        title="Thống kê Voucher"
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setStatsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {voucherStats && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Lượt sử dụng"
                    value={voucherStats.usageCount}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng giảm giá"
                    value={voucherStats.totalDiscount}
                    suffix="đ"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Trung bình/đơn"
                    value={
                      voucherStats.usageCount > 0
                        ? Math.round(voucherStats.totalDiscount / voucherStats.usageCount)
                        : 0
                    }
                    suffix="đ"
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={[
                {
                  title: 'Mã đơn',
                  dataIndex: ['order', 'orderNumber'],
                  key: 'orderNumber',
                },
                {
                  title: 'Khách hàng',
                  dataIndex: ['user', 'name'],
                  key: 'userName',
                },
                {
                  title: 'Giảm giá',
                  dataIndex: 'discountAmount',
                  key: 'discountAmount',
                  render: (value) => `${value.toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Tổng đơn',
                  dataIndex: ['order', 'totalAmount'],
                  key: 'totalAmount',
                  render: (value) => `${value.toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Ngày sử dụng',
                  dataIndex: 'usedAt',
                  key: 'usedAt',
                  render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                },
              ]}
              dataSource={voucherStats.usages}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </>
        )}
      </Modal>
    </div>
  )
}

export default VouchersPage
