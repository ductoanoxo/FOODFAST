import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Switch,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PercentageOutlined,
  TagOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
} from '../../api/promotionAPI';
import { getCategoriesWithProducts } from '../../api/categoryAPI';
import './PromotionsPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPromotions();
    loadCategories();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await getPromotions();
      setPromotions(response.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách khuyến mãi');
      console.error('Load promotions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Chỉ load categories có sản phẩm của nhà hàng này
      const response = await getCategoriesWithProducts();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Load categories error:', error);
      message.warning('Chưa có danh mục nào có sản phẩm. Vui lòng tạo sản phẩm trước.');
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      discountPercent: record.discountPercent,
      category: record.category._id,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePromotion(id);
      message.success('Xóa khuyến mãi thành công!');
      loadPromotions();
    } catch (error) {
      message.error('Không thể xóa khuyến mãi');
      console.error('Delete error:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await togglePromotionStatus(id);
      message.success('Cập nhật trạng thái thành công!');
      loadPromotions();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
      console.error('Toggle error:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.name,
        description: values.description,
        discountPercent: values.discountPercent,
        category: values.category,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion._id, data);
        message.success('Cập nhật khuyến mãi thành công!');
      } else {
        await createPromotion(data);
        message.success('Tạo khuyến mãi thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      loadPromotions();
    } catch (error) {
      message.error('Không thể lưu khuyến mãi');
      console.error('Submit error:', error);
    }
  };

  const columns = [
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      align: 'center',
      render: (value) => (
        <Tag color="red" icon={<PercentageOutlined />}>
          {value}%
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dateRange',
      render: (_, record) => (
        <div>
          <div>Từ: {dayjs(record.startDate).format('DD/MM/YYYY')}</div>
          <div>Đến: {dayjs(record.endDate).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const now = new Date();
        const isExpired = new Date(record.endDate) < now;
        const isUpcoming = new Date(record.startDate) > now;
        
        if (isExpired) {
          return <Tag color="default">Hết hạn</Tag>;
        }
        if (isUpcoming) {
          return <Tag color="orange">Sắp diễn ra</Tag>;
        }
        return record.isActive ? (
          <Tag color="success">Đang hoạt động</Tag>
        ) : (
          <Tag color="default">Tạm dừng</Tag>
        );
      },
    },
    {
      title: 'Kích hoạt',
      key: 'active',
      align: 'center',
      render: (_, record) => {
        const isExpired = new Date(record.endDate) < new Date();
        return (
          <Switch
            checked={record.isActive}
            disabled={isExpired}
            onChange={() => handleToggleStatus(record._id)}
          />
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa khuyến mãi"
            description="Bạn có chắc muốn xóa khuyến mãi này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activePromotions = promotions.filter(p => {
    const now = new Date();
    return p.isActive && 
           new Date(p.startDate) <= now && 
           new Date(p.endDate) >= now;
  });

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <div>
          <Title level={2}>Quản lý khuyến mãi</Title>
          <Text type="secondary">
            Tạo khuyến mãi giảm giá theo danh mục sản phẩm
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreate}
        >
          Tạo khuyến mãi
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng khuyến mãi"
              value={promotions.length}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activePromotions.length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Danh mục có khuyến mãi"
              value={new Set(activePromotions.map(p => p.category._id)).size}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khuyến mãi`,
          }}
        />
      </Card>

      <Modal
        title={editingPromotion ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tên khuyến mãi"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
          >
            <Input
              size="large"
              placeholder="VD: Giảm giá đồ uống mùa hè"
              maxLength={100}
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea
              rows={3}
              placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục áp dụng"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                help={categories.length === 0 ? 'Chưa có danh mục nào có sản phẩm. Vui lòng tạo sản phẩm trước.' : ''}
              >
                <Select
                  size="large"
                  placeholder={categories.length === 0 ? 'Chưa có danh mục khả dụng' : 'Chọn danh mục'}
                  disabled={categories.length === 0}
                  options={categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="% Giảm giá"
                name="discountPercent"
                rules={[
                  { required: true, message: 'Vui lòng nhập % giảm giá!' },
                  { type: 'number', min: 1, max: 100, message: 'Từ 1% đến 100%' },
                ]}
              >
                <InputNumber
                  size="large"
                  min={1}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value.replace('%', '')}
                  style={{ width: '100%' }}
                  placeholder="20"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[
              { required: true, message: 'Vui lòng chọn thời gian!' },
              {
                validator: (_, value) => {
                  if (value && value[0] && value[1]) {
                    if (value[1].isBefore(value[0])) {
                      return Promise.reject('Ngày kết thúc phải sau ngày bắt đầu!');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RangePicker
              size="large"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingPromotion ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsPage;
