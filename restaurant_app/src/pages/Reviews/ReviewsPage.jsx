import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Rate,
  Row,
  Col,
  Button,
  Space,
  Input,
  Select,
  Avatar,
  Typography,
  Modal,
  message,
  Divider,
  Image,
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getRestaurantReviews, updateReview } from '../../api/restaurantAPI';
import './ReviewsPage.css';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getRestaurantReviews();
      
      // Lấy data từ response
      const reviewsData = response.data || [];
      
      // Transform data để đảm bảo có đầy đủ thông tin
      const transformedReviews = reviewsData.map(review => ({
        ...review,
        user: review.user || { name: 'Khách hàng', avatar: null },
        product: review.product || { name: 'Sản phẩm', image: null },
        images: review.images || [], // Ensure images is an array
      }));
      
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Load reviews error:', error);
      message.error('Không thể tải đánh giá: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.restaurantReply || '');
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }
    
    try {
      
      // Cập nhật review với restaurantReply
      await updateReview(selectedReview._id, {
        restaurantReply: replyText,
        repliedAt: new Date().toISOString(),
      });
      
      message.success('Đã gửi phản hồi thành công!');
      setReplyModalVisible(false);
      setReplyText('');
      setSelectedReview(null);
      
      // Reload lại danh sách reviews
      await loadReviews();
    } catch (error) {
      console.error('Submit reply error:', error);
      message.error('Không thể gửi phản hồi: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      // Do nothing
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchRating =
      filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchProduct =
      filterProduct === 'all' || review.product?.name === filterProduct;
    const matchSearch =
      (review.comment || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (review.user?.name || '').toLowerCase().includes(searchText.toLowerCase());

    return matchRating && matchProduct && matchSearch;
  });

  const getProductOptions = () => {
    const products = [...new Set(reviews
      .map((r) => r.product?.name)
      .filter(name => name))]; // Lọc bỏ undefined/null
    return products.map((p) => ({ label: p, value: p }));
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.user.avatar} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(record.createdAt).fromNow()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Món ăn',
      dataIndex: ['product', 'name'],
      key: 'product',
      width: 200,
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 150,
      render: (_, record) => (
        <div>
          <Rate disabled value={record.rating} style={{ fontSize: 16 }} />
          <div>
            <Text type="secondary">({record.rating}/5)</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      render: (_, record) => (
        <div>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
            style={{ marginBottom: 8 }}
          >
            {record.comment}
          </Paragraph>
          {record.images && record.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <Image.PreviewGroup>
                {record.images.map((img, index) => (
                  <Image
                    key={index}
                    width={50}
                    height={50}
                    src={img}
                    alt={`Review image ${index + 1}`}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          )}
          {record.restaurantReply && (
            <div
              style={{
                background: '#f0f2f5',
                padding: '8px 12px',
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <Text strong style={{ fontSize: 12, color: '#1890ff' }}>
                📝 Phản hồi của bạn:
              </Text>
              <Paragraph style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                {record.restaurantReply}
              </Paragraph>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type={record.restaurantReply ? 'default' : 'primary'}
          icon={<MessageOutlined />}
          size="small"
          onClick={() => handleReply(record)}
        >
          {record.restaurantReply ? 'Sửa phản hồi' : 'Trả lời'}
        </Button>
      ),
    },
  ];

  // Calculate average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? ((reviews.filter((r) => r.rating === star).length / reviews.length) *
            100
          ).toFixed(0)
        : 0,
  }));

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <div>
          <Title level={2}>Quản lý đánh giá</Title>
          <Text type="secondary">Xem và phản hồi đánh giá từ khách hàng</Text>
        </div>
      </div>

      {/* Summary Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#faad14' }}>
                {avgRating}
                <StarOutlined style={{ fontSize: 32, marginLeft: 8 }} />
              </div>
              <Rate disabled value={parseFloat(avgRating)} allowHalf />
              <div style={{ marginTop: 8, color: '#8c8c8c' }}>
                Dựa trên {reviews.length} đánh giá
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div>
              {ratingDistribution.map((item) => (
                <div
                  key={item.star}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ width: 80 }}>
                    {item.star} <StarOutlined style={{ color: '#faad14' }} />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: '#f0f0f0',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        background: '#faad14',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <div style={{ width: 80, textAlign: 'right' }}>
                    {item.count} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm đánh giá..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            value={filterRating}
            onChange={setFilterRating}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Tất cả đánh giá</Select.Option>
            <Select.Option value="5">5 sao</Select.Option>
            <Select.Option value="4">4 sao</Select.Option>
            <Select.Option value="3">3 sao</Select.Option>
            <Select.Option value="2">2 sao</Select.Option>
            <Select.Option value="1">1 sao</Select.Option>
          </Select>
          <Select
            value={filterProduct}
            onChange={setFilterProduct}
            style={{ width: 200 }}
          >
            <Select.Option value="all">Tất cả món ăn</Select.Option>
            {getProductOptions().map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Reviews Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} đánh giá`,
          }}
        />
      </Card>

      {/* Reply Modal */}
      <Modal
        title="Phản hồi đánh giá"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={handleSubmitReply}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={600}
      >
        {selectedReview && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{selectedReview.user.name}</Text>
                  <br />
                  <Rate disabled value={selectedReview.rating} style={{ fontSize: 14 }} />
                </div>
              </Space>
              <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                {selectedReview.comment}
              </Paragraph>
            </div>
            <Divider />
            <div>
              <Text strong>Phản hồi của bạn:</Text>
              <TextArea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập phản hồi của bạn..."
                style={{ marginTop: 8 }}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ReviewsPage;
