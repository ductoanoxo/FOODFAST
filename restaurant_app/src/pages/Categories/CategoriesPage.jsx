import { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Table,
  Space,
  message,
  Modal,
  Form,
  Input,
  Switch,
  Popconfirm,
  Upload,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  getCategoriesWithProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/categoryAPI';
import './CategoriesPage.css';

const { Title, Text } = Typography;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesWithProducts();
      const list = response.data || [];
      setCategories(list);
    } catch (error) {
      message.error('Không thể tải danh mục: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Mở modal thêm mới
  const handleAdd = () => {
    setEditingCategory(null);
    setImageUrl('');
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (category) => {
    setEditingCategory(category);
    setImageUrl(category.image || '');
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon,
      isActive: category.isActive !== false,
    });
    setModalVisible(true);
  };

  // Xóa category
  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success('Xóa danh mục thành công!');
      loadCategories();
    } catch (error) {
      message.error('Không thể xóa danh mục: ' + error);
    }
  };

  // Submit form
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory(values);
        message.success('Thêm danh mục thành công!');
      }
      setModalVisible(false);
      loadCategories();
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + error);
    }
  };

  // Columns cho table
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) =>
        image ? (
          <img
            src={image}
            alt="category"
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text type="secondary">No Image</Text>
          </div>
        ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) => (
        <Switch checked={isActive !== false} disabled />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc muốn xóa danh mục này?"
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

  return (
    <div className="categories-page">
      <Card>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Title level={2}>Quản lý danh mục</Title>
              <Text type="secondary">
                Quản lý các danh mục món ăn của nhà hàng
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm danh mục mới
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="VD: Tráng miệng, Khai vị, Đồ uống..." />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả về danh mục này..."
            />
          </Form.Item>

          <Form.Item label="URL Hình ảnh" name="image">
            <Input
              placeholder="https://res.cloudinary.com/dp4o6la8b/image/upload/v1761115010/image.jpg"
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Form.Item>

          {imageUrl && (
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <img
                src={imageUrl}
                alt="preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <Form.Item label="Icon (emoji hoặc URL)" name="icon">
            <Input placeholder="🍰 hoặc URL icon" />
          </Form.Item>

          <Form.Item
            label="Kích hoạt"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
