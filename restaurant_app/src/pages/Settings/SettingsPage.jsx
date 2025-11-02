import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Switch,
  TimePicker,
  Select,
  Row,
  Col,
  message,
  Divider,
  Typography,
  Space,
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getRestaurantInfo, updateRestaurantInfo } from '../../api/restaurantAPI';
import axios from '../../api/axios';
import './SettingsPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SettingsPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [logoFileList, setLogoFileList] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    loadRestaurantInfo();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/categories');
      const data = response.data?.data || response.data || [];
      setAvailableCategories(data.map(cat => cat.name || cat));
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories nếu API fails
      setAvailableCategories(['Việt Nam', 'Cơm', 'Phở', 'Bún', 'Fastfood', 'Hải sản', 'Lẩu', 'Đồ uống']);
    }
  };

  const loadRestaurantInfo = async () => {
    try {
      setLoadingData(true);
      const response = await getRestaurantInfo();
      const data = response.data;
      
      // Parse openingHours (format: "8:00 - 22:00")
      let openTime = null;
      let closeTime = null;
      if (data.openingHours) {
        const [open, close] = data.openingHours.split(' - ');
        openTime = open ? dayjs(open, 'H:mm') : null;
        closeTime = close ? dayjs(close, 'H:mm') : null;
      }
      
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        address: data.address,
        categories: data.categories || [],
        isOpen: data.isOpen !== false,
        openTime: openTime,
        closeTime: closeTime,
        deliveryTime: data.deliveryTime || '20-30',
      });

      // Set existing image
      if (data.image) {
        setLogoFileList([{
          uid: '-1',
          name: 'image.jpg',
          status: 'done',
          url: data.image,
        }]);
      }
      
    } catch (error) {
  messageApi.error('Không thể tải thông tin nhà hàng: ' + (error?.message || error));
      console.error('Load error:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Kết hợp openTime và closeTime thành openingHours
      if (values.openTime && values.closeTime) {
        formData.append('openingHours', `${values.openTime.format('H:mm')} - ${values.closeTime.format('H:mm')}`);
      }
      
      // Append text fields (trừ openTime, closeTime, image vì đã xử lý)
      Object.keys(values).forEach((key) => {
        if (!['openTime', 'closeTime', 'image'].includes(key)) {
          if (Array.isArray(values[key])) {
            formData.append(key, JSON.stringify(values[key]));
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Append image file (chỉ upload nếu user chọn ảnh mới)
      if (logoFileList.length > 0 && logoFileList[0].originFileObj) {
        formData.append('image', logoFileList[0].originFileObj);
      }

      await updateRestaurantInfo(formData);
      
      messageApi.success('Cập nhật thông tin thành công!');
      loadRestaurantInfo();
    } catch (error) {
      messageApi.error('Không thể cập nhật: ' + (error?.message || error));
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageApi.error('Chỉ được upload file ảnh!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        messageApi.error('Ảnh phải nhỏ hơn 2MB!');
        return false;
      }
      return false; // Prevent auto upload
    },
    maxCount: 1,
  };

  return (
    <div className="settings-page">
      {contextHolder}
      <div className="settings-header">
        <Title level={2}>Cài đặt nhà hàng</Title>
        <Text type="secondary">Quản lý thông tin và cài đặt nhà hàng</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={24}>
          {/* Basic Info */}
          <Col xs={24} lg={12}>
            <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Tên nhà hàng"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng!' }]}
              >
                <Input size="large" placeholder="VD: Cơm Tấm Sài Gòn" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả về nhà hàng của bạn..."
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <Input size="large" placeholder="0901234567" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input size="large" placeholder="email@example.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input size="large" placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" />
              </Form.Item>

              <Form.Item
                label="Loại nhà hàng / Món ăn"
                name="categories"
                rules={[{ required: true, message: 'Vui lòng chọn loại nhà hàng!' }]}
              >
                <Select
                  mode="tags"
                  size="large"
                  placeholder="Chọn hoặc nhập loại nhà hàng"
                  options={availableCategories.map(cat => ({ value: cat, label: cat }))}
                  maxTagCount={5}
                />
              </Form.Item>
              
              <Form.Item
                label="Thời gian giao hàng (phút)"
                name="deliveryTime"
              >
                <Input 
                  size="large" 
                  placeholder="VD: 20-30" 
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Images & Settings */}
          <Col xs={24} lg={12}>
            {/* Images */}
            <Card title="Hình ảnh" style={{ marginBottom: 24 }}>
              <Form.Item label="Ảnh nhà hàng">
                <Upload
                  {...uploadProps}
                  listType="picture-card"
                  fileList={logoFileList}
                  onChange={({ fileList }) => setLogoFileList(fileList)}
                >
                  {logoFileList.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload ảnh</div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Kích thước đề xuất: 800x600px
                </Text>
              </Form.Item>
            </Card>

            {/* Operating Hours */}
            <Card title="Giờ hoạt động" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Trạng thái"
                name="isOpen"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Đang mở"
                  unCheckedChildren="Đã đóng"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Giờ mở cửa"
                    name="openTime"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa!' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      size="large"
                      style={{ width: '100%' }}
                      placeholder="08:00"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Giờ đóng cửa"
                    name="closeTime"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ đóng cửa!' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      size="large"
                      style={{ width: '100%' }}
                      placeholder="22:00"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Lưu thay đổi
            </Button>
            <Button size="large" onClick={() => form.resetFields()}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsPage;
