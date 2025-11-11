import { useState, useEffect, useCallback } from 'react'
import { Card, List, Rate, Avatar, Typography, Empty, Spin, Progress, Row, Col } from 'antd'
import { UserOutlined, StarFilled } from '@ant-design/icons'
import { reviewAPI } from '../../api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import './ReviewList.css'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Text, Title, Paragraph } = Typography

const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        distribution: [0, 0, 0, 0, 0]
    })

    const calculateStats = useCallback((reviewsData) => {
        const total = reviewsData.length
        if (total === 0) {
            setStats({
                averageRating: 0,
                totalReviews: 0,
                distribution: [0, 0, 0, 0, 0]
            })
            return
        }

        const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0)
        const average = sum / total

        const distribution = [0, 0, 0, 0, 0]
        reviewsData.forEach(review => {
            distribution[5 - review.rating]++
        })

        setStats({
            averageRating: average,
            totalReviews: total,
            distribution
        })
    }, [])

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true)
            const response = await reviewAPI.getProductReviews(productId)
            
            // Response from axios interceptor has extracted data
            if (response.success) {
                const reviewsData = response.data || []
                setReviews(reviewsData)
                calculateStats(reviewsData)
            }
        } catch (error) {
            console.error('Error loading reviews:', error)
            // Do not show error message if there are no reviews
            setReviews([])
            calculateStats([])
        } finally {
            setLoading(false)
        }
    }, [productId, calculateStats])

    useEffect(() => {
        if (productId) {
            loadReviews()
        }
    }, [productId, loadReviews])

    const renderStatsCard = () => (
        <Card className="review-stats-card">
            <Row gutter={24}>
                <Col xs={24} md={8} className="stats-left">
                    <div className="average-rating">
                        <div className="rating-number">{stats.averageRating.toFixed(1)}</div>
                        <Rate disabled value={stats.averageRating} allowHalf />
                        <Text type="secondary" className="total-reviews">
                            {stats.totalReviews} đánh giá
                        </Text>
                    </div>
                </Col>
                <Col xs={24} md={16} className="stats-right">
                    <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map((star, index) => {
                            const count = stats.distribution[index]
                            const percentage = stats.totalReviews > 0 
                                ? (count / stats.totalReviews) * 100 
                                : 0
                            
                            return (
                                <div key={star} className="rating-row">
                                    <Text className="star-label">{star} <StarFilled /></Text>
                                    <Progress 
                                        percent={percentage} 
                                        showInfo={false}
                                        strokeColor="#faad14"
                                        className="rating-progress"
                                    />
                                    <Text className="count-label">
                                        {count} ({percentage.toFixed(0)}%)
                                    </Text>
                                </div>
                            )
                        })}
                    </div>
                </Col>
            </Row>
        </Card>
    )

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="review-list-container">
            <Title level={4}>Đánh giá sản phẩm</Title>
            
            {stats.totalReviews > 0 && renderStatsCard()}

            {reviews.length === 0 ? (
                <Empty 
                    description="Chưa có đánh giá nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <List
                    className="review-list"
                    itemLayout="vertical"
                    dataSource={reviews}
                    renderItem={(review) => (
                        <List.Item key={review._id} className="review-item">
                            <div className="review-header">
                                <Avatar 
                                    src={review.user?.avatar} 
                                    icon={<UserOutlined />}
                                    size={48}
                                />
                                <div className="review-user-info">
                                    <Text strong className="user-name">
                                        {review.user?.name || 'Khách hàng'}
                                    </Text>
                                    <div className="review-rating-date">
                                        <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                                        <Text type="secondary" className="review-date">
                                            {dayjs(review.createdAt).fromNow()}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                            
                            <Paragraph className="review-comment">
                                {review.comment}
                            </Paragraph>

                            {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                    {review.images.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={img} 
                                            alt={`review-${idx}`}
                                            className="review-image"
                                        />
                                    ))}
                                </div>
                            )}

                            {review.isVerified && (
                                <div className="verified-badge">
                                    ✓ Đã mua hàng
                                </div>
                            )}
                        </List.Item>
                    )}
                    pagination={reviews.length > 5 ? {
                        pageSize: 5,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} đánh giá`
                    } : false}
                />
            )}
        </div>
    )
}

export default ReviewList
