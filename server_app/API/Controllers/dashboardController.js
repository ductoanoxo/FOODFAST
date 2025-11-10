const asyncHandler = require('../Middleware/asyncHandler')
const User = require('../Models/User')
const Restaurant = require('../Models/Restaurant')
const Order = require('../Models/Order')
const Drone = require('../Models/Drone')

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async(req, res) => {
    // Get counts
    const totalUsers = await User.countDocuments()
    const totalRestaurants = await Restaurant.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalDrones = await Drone.countDocuments()

    // Active counts
    const activeUsers = await User.countDocuments({ isActive: true })
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true })
    const activeDrones = await Drone.countDocuments({ status: 'available' })

    // Order statistics
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const completedOrders = await Order.countDocuments({ status: 'delivered' })
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' })

    // Revenue calculation
    const revenueResult = await Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Today's statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await Order.countDocuments({
        createdAt: { $gte: today }
    })

    const todayRevenue = await Order.aggregate([{
            $match: {
                status: 'delivered',
                createdAt: { $gte: today }
            }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
    const todayRevenueTotal = todayRevenue.length > 0 ? todayRevenue[0].total : 0

    // Payment statistics
    const paymentStats = await Order.aggregate([
        {
            $group: {
                _id: '$paymentStatus',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
            }
        }
    ])

    const paymentBreakdown = {}
    paymentStats.forEach(item => {
        paymentBreakdown[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
        }
    })

    // Payment method statistics
    const paymentMethodStats = await Order.aggregate([
        {
            $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 }
            }
        }
    ])

    const paymentMethodBreakdown = {}
    paymentMethodStats.forEach(item => {
        paymentMethodBreakdown[item._id] = item.count
    })

    // Refund statistics
    const refundedOrders = await Order.countDocuments({ 
        paymentStatus: { $in: ['refunded', 'refund_pending'] }
    })
    
    const refundAmount = await Order.aggregate([
        { 
            $match: { 
                paymentStatus: 'refunded',
                'refundInfo.amount': { $exists: true }
            } 
        },
        { 
            $group: { 
                _id: null, 
                total: { $sum: '$refundInfo.amount' } 
            } 
        }
    ])
    const totalRefundAmount = refundAmount.length > 0 ? refundAmount[0].total : 0

    // Delivery statistics
    const deliveryStats = await Order.aggregate([
        {
            $match: {
                distanceKm: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: null,
                avgDistance: { $avg: '$distanceKm' },
                maxDistance: { $max: '$distanceKm' },
                minDistance: { $min: '$distanceKm' },
                avgDuration: { $avg: '$estimatedDuration' },
                avgDeliveryFee: { $avg: '$deliveryFee' }
            }
        }
    ])

    // Routing method statistics
    const routingMethodStats = await Order.aggregate([
        {
            $match: {
                routingMethod: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: '$routingMethod',
                count: { $sum: 1 }
            }
        }
    ])

    const routingMethodBreakdown = {}
    routingMethodStats.forEach(item => {
        routingMethodBreakdown[item._id] = item.count
    })

    // Promotion & Voucher statistics
    const ordersWithVouchers = await Order.countDocuments({
        'appliedVoucher.id': { $exists: true, $ne: null }
    })

    const ordersWithPromotions = await Order.countDocuments({
        appliedPromotions: { $exists: true, $ne: [], $not: { $size: 0 } }
    })

    const discountStats = await Order.aggregate([
        {
            $match: {
                discount: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: null,
                totalDiscount: { $sum: '$discount' },
                avgDiscount: { $avg: '$discount' },
                count: { $sum: 1 }
            }
        }
    ])

    res.json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                active: activeUsers,
            },
            restaurants: {
                total: totalRestaurants,
                active: activeRestaurants,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                today: todayOrders,
            },
            drones: {
                total: totalDrones,
                available: activeDrones,
            },
            revenue: {
                total: totalRevenue,
                today: todayRevenueTotal,
            },
            payment: {
                statusBreakdown: paymentBreakdown,
                methodBreakdown: paymentMethodBreakdown,
                refunded: {
                    count: refundedOrders,
                    amount: totalRefundAmount
                }
            },
            delivery: deliveryStats.length > 0 ? {
                avgDistance: Math.round(deliveryStats[0].avgDistance * 100) / 100,
                maxDistance: Math.round(deliveryStats[0].maxDistance * 100) / 100,
                minDistance: Math.round(deliveryStats[0].minDistance * 100) / 100,
                avgDuration: Math.round(deliveryStats[0].avgDuration),
                avgDeliveryFee: Math.round(deliveryStats[0].avgDeliveryFee)
            } : null,
            routing: {
                methodBreakdown: routingMethodBreakdown
            },
            promotions: {
                ordersWithVouchers,
                ordersWithPromotions,
                discount: discountStats.length > 0 ? {
                    total: Math.round(discountStats[0].totalDiscount),
                    average: Math.round(discountStats[0].avgDiscount),
                    count: discountStats[0].count
                } : null
            }
        },
    })
})

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async(req, res) => {
    const limit = parseInt(req.query.limit) || 10

    const orders = await Order.find()
        .populate('user', 'name email phone')
        .populate('restaurant', 'name address image')
        .populate('drone', 'droneId status batteryLevel')
        .populate('pickedUpBy', 'name email')
        .populate({
            path: 'items.product',
            select: 'name image price'
        })
        .sort('-createdAt')
        .limit(limit)

    res.json({
        success: true,
        data: orders,
    })
})

// @desc    Get top restaurants
// @route   GET /api/dashboard/top-restaurants
// @access  Private/Admin
const getTopRestaurants = asyncHandler(async(req, res) => {
    const limit = parseInt(req.query.limit) || 5

    // Compute rating and reviewCount from actual product reviews so we don't
    // show the schema default (e.g., rating: 5) when there are no reviews.
    // Aggregate products -> reviews to compute per-restaurant averages.
    const restaurants = await Restaurant.aggregate([
        // keep basic restaurant data
        {
            $project: {
                name: 1,
                image: 1,
                address: 1,
            }
        },
        // lookup products of the restaurant
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'restaurant',
                as: 'products'
            }
        },
        // unwind products to be able to join reviews; preserve restaurants with no products
        { $unwind: { path: '$products', preserveNullAndEmptyArrays: true } },
        // lookup reviews for each product
        {
            $lookup: {
                from: 'reviews',
                localField: 'products._id',
                foreignField: 'product',
                as: 'productReviews'
            }
        },
        // unwind reviews (preserve restaurants with no reviews)
        { $unwind: { path: '$productReviews', preserveNullAndEmptyArrays: true } },
        // group back to restaurant level and compute sums/counts
        {
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                image: { $first: '$image' },
                address: { $first: '$address' },
                ratingSum: { $sum: { $ifNull: ['$productReviews.rating', 0] } },
                reviewCount: { $sum: { $cond: [{ $ifNull: ['$productReviews._id', false] }, 1, 0] } }
            }
        },
        // compute average rating; if no reviews, set rating to 0 (so it doesn't show default 5)
        {
            $addFields: {
                rating: {
                    $cond: [
                        { $gt: ['$reviewCount', 0] },
                        { $round: [{ $divide: ['$ratingSum', '$reviewCount'] }, 1] },
                        0
                    ]
                }
            }
        },
        // sort by computed rating desc, then reviewCount desc
        { $sort: { rating: -1, reviewCount: -1 } },
        { $limit: limit }
    ])

    res.json({
        success: true,
        data: restaurants,
    })
})

// @desc    Get order statistics by date
// @route   GET /api/dashboard/order-stats
// @access  Private/Admin
const getOrderStatistics = asyncHandler(async(req, res) => {
    const days = parseInt(req.query.days) || 7

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const stats = await Order.aggregate([{
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'delivered'] },
                            '$totalAmount',
                            0
                        ]
                    }
                },
                avgDeliveryFee: { $avg: '$deliveryFee' },
                avgDiscount: { $avg: '$discount' },
                avgDistance: { $avg: '$distanceKm' },
                avgDuration: { $avg: '$estimatedDuration' },
                ordersWithVoucher: {
                    $sum: {
                        $cond: [
                            { $ne: ['$appliedVoucher', null] },
                            1,
                            0
                        ]
                    }
                },
                ordersWithPromotion: {
                    $sum: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$appliedPromotions', []] } }, 0] },
                            1,
                            0
                        ]
                    }
                },
                refundedOrders: {
                    $sum: {
                        $cond: [
                            { $eq: ['$paymentStatus', 'refunded'] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ])

    res.json({
        success: true,
        data: stats,
    })
})

module.exports = {
    getDashboardStats,
    getRecentOrders,
    getTopRestaurants,
    getOrderStatistics,
}