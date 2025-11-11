import { useState, useEffect, useCallback } from 'react'
import { Card, List, Rate, Typography, Button, Empty, Spin, Tag, message, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { reviewAPI } from '../../api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import './MyReviews.css'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Text, Title, Paragraph } = Typography

const MyReviews = () => {
    const { user } = useSelector(state => state.auth)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(false)

    const loadMyReviews = useCallback(async () => {
        try {
            setLoading(true)
            const response = await reviewAPI.getUserReviews(user._id)
            
            if (response.data.success) {
                setReviews(response.data.data || [])
            }
        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error)
            message.error('Không thể tải đánh giá của bạn')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            loadMyReviews()
        }
    }, [user, loadMyReviews])

    const handleDelete = async (reviewId) => {
        try {
            const response = await reviewAPI.deleteReview(reviewId)
            if (response.data.success) {
                message.success('Đã xóa đánh giá')
                loadMyReviews()
            }
        } catch (error) {
            console.error('Lỗi khi xóa đánh giá:', error)
            message.error('Không thể xóa đánh giá')
        }
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="my-reviews-page">
            <Card>
                <Title level={3}>Đánh giá của tôi</Title>
                
                {reviews.length === 0 ? (
                    <Empty 
                        description="Bạn chưa có đánh giá nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <List
                        className="my-reviews-list"
                        itemLayout="vertical"
                        dataSource={reviews}
                        renderItem={(review) => (
                            <List.Item 
                                key={review._id}
                                className="review-item"
                                actions={[
                                    <Popconfirm
                                        key="delete"
                                        title="Xóa đánh giá"
                                        description="Bạn có chắc muốn xóa đánh giá này?"
                                        onConfirm={() => handleDelete(review._id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button 
                                            danger
                                            icon={<DeleteOutlined />}
                                        >
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <img 
                                            src={review.product?.image || '/placeholder-food.jpg'} 
                                            alt={review.product?.name}
                                            style={{ 
                                                width: 80, 
                                                height: 80, 
                                                objectFit: 'cover',
                                                borderRadius: 8 
                                            }}
                                        />
                                    }
                                    title={
                                        <div>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {review.product?.name || 'Sản phẩm'}
                                            </Text>
                                            {review.isVerified && (
                                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                                    ✓ Đã mua
                                                </Tag>
                                            )}
                                        </div>
                                    }
                                    description={
                                        <div style={{ marginTop: 8 }}>
                                            <Rate disabled value={review.rating} style={{ fontSize: 16 }} />
                                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                                                {dayjs(review.createdAt).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                />
                                
                                <Paragraph style={{ marginTop: 12 }}>
                                    {review.comment}
                                </Paragraph>

                                {review.images && review.images.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        {review.images.map((img, idx) => (
                                            <img 
                                                key={idx} 
                                                src={img} 
                                                alt={`review-${idx}`}
                                                style={{ 
                                                    width: 60, 
                                                    height: 60, 
                                                    objectFit: 'cover',
                                                    borderRadius: 6
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {review.restaurantReply && (
                                    <div className="restaurant-reply">
                                        <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
                                            📝 Phản hồi từ nhà hàng:
                                        </Text>
                                        <Paragraph style={{ margin: '8px 0 0 0', fontSize: 13 }}>
                                            {review.restaurantReply}
                                        </Paragraph>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {dayjs(review.repliedAt).fromNow()}
                                        </Text>
                                    </div>
                                )}
                            </List.Item>
                        )}
                        pagination={reviews.length > 10 ? {
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} đánh giá`
                        } : false}
                    />
                )}
            </Card>
        </div>
    )
}

export default MyReviews
