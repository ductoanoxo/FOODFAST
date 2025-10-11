const asyncHandler = require('../Middleware/asyncHandler')
const User = require('../Models/User')

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
    const { role, search } = req.query

    let query = {}

    if (role) {
        query.role = role
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ]
    }

    const users = await User.find(query).select('-password').sort('-createdAt')

    res.json({
        success: true,
        count: users.length,
        data: users,
    })
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    res.json({
        success: true,
        data: user,
    })
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
    let user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Don't allow password update through this endpoint
    if (req.body.password) {
        delete req.body.password
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).select('-password')

    res.json({
        success: true,
        data: user,
    })
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    await user.deleteOne()

    res.json({
        success: true,
        data: {},
    })
})

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin)
const getUserStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' })
    const totalRestaurants = await User.countDocuments({ role: 'restaurant' })
    const totalAdmins = await User.countDocuments({ role: 'admin' })

    // Users registered this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const newUsersThisMonth = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: firstDayOfMonth },
    })

    res.json({
        success: true,
        data: {
            totalUsers,
            totalRestaurants,
            totalAdmins,
            newUsersThisMonth,
        },
    })
})

// @desc    Get user orders
// @route   GET /api/users/:id/orders
// @access  Private (Admin or User owns)
const getUserOrders = asyncHandler(async (req, res) => {
    const Order = require('../Models/Order')

    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check permission
    if (
        req.user.role !== 'admin' &&
        user._id.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized')
    }

    const orders = await Order.find({ user: req.params.id })
        .populate('items.product', 'name image price')
        .populate('restaurant', 'name image')
        .sort('-createdAt')

    res.json({
        success: true,
        count: orders.length,
        data: orders,
    })
})

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    getUserOrders,
}
