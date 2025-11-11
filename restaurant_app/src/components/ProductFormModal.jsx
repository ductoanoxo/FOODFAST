import { Modal, Form, Input, InputNumber, Select, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getCategories } from '../api/productAPI';

const { TextArea } = Input;

const ProductFormModal = ({ visible, product, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Set initial values when editing — only when modal is visible (form mounted)
  useEffect(() => {
    if (!visible) {
      form.resetFields()
      setFileList([])
      return
    }

    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        // category might be stored as an object ({ _id, name }) or a string key
        category: product.category?._id || product.category || undefined,
        isAvailable: product.isAvailable,
      })
      if (product.image) {
        setFileList([{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: product.image,
        }])
      }
    } else {
      form.resetFields()
      setFileList([])
    }
  }, [product, form, visible]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCategories();
        // productAPI returns response.data which may be { success, count, data: [...] }
        const list = Array.isArray(res) ? res : (res && res.data) ? res.data : []
        setCategories(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    load()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('price', values.price);
      formData.append('category', values.category);
      formData.append('isAvailable', values.isAvailable ?? true);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      await onSubmit(formData);
      form.resetFields();
      setFileList([]);
      onClose();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được upload file ảnh!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Ảnh phải nhỏ hơn 2MB!');
        return false;
      }
      return false; // Prevent auto upload
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1)); // Only keep the last file
    },
    maxCount: 1,
  };

  return (
    <Modal
      title={product ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isAvailable: true,
        }}
      >
        <Form.Item
          name="name"
          label="Tên món ăn"
          rules={[{ required: true, message: 'Vui lòng nhập tên món ăn!' }]}
        >
          <Input placeholder="Nhập tên món ăn" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={3} placeholder="Nhập mô tả món ăn" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá (VNĐ)"
          rules={[
            { required: true, message: 'Vui lòng nhập giá!' },
            { type: 'number', min: 0, message: 'Giá phải lớn hơn 0!' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập giá"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.length === 0 ? (
              // fallback static options
              <>
                <Select.Option value="rice">Cơm</Select.Option>
                <Select.Option value="noodles">Mì/Phở</Select.Option>
                <Select.Option value="drinks">Đồ uống</Select.Option>
                <Select.Option value="snacks">Đồ ăn vặt</Select.Option>
                <Select.Option value="desserts">Tráng miệng</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </>
            ) : (
              categories.map((c) => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              ))
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="isAvailable"
          label="Trạng thái"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value={true}>Còn hàng</Select.Option>
            <Select.Option value={false}>Hết hàng</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Hình ảnh">
          <Upload {...uploadProps} listType="picture-card">
            {fileList.length < 1 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {product ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
