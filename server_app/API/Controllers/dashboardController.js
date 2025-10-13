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
        },
    })
})

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async(req, res) => {
    const limit = parseInt(req.query.limit) || 10

    const orders = await Order.find()
        .populate('user', 'name email')
        .populate('restaurant', 'name')
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

    const restaurants = await Restaurant.find()
        .sort('-rating -reviewCount')
        .limit(limit)
        .select('name rating reviewCount image address')

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