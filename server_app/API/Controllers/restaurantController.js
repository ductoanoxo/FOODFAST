const asyncHandler = require('../Middleware/asyncHandler')
const Restaurant = require('../Models/Restaurant')
const User = require('../Models/User')
const bcrypt = require('bcryptjs')

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async(req, res) => {
    const { search, rating, isOpen } = req.query

    let query = {}

    // Search filter
    if (search) {
        query.name = { $regex: search, $options: 'i' }
    }

    // Rating filter
    if (rating) {
        query.rating = { $gte: Number(rating) }
    }

    // Open/Closed filter
    if (isOpen !== undefined) {
        query.isOpen = isOpen === 'true'
    }

    const restaurants = await Restaurant.find(query)
        .populate('owner', 'name email phone role')
        .sort('-rating')

    res.json({
        success: true,
        count: restaurants.length,
        data: restaurants,
    })
})

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async(req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
        .populate('owner', 'name email phone')

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    res.json({
        success: true,
        data: restaurant,
    })
})

// @desc    Get nearby restaurants (geospatial)
// @route   GET /api/restaurants/nearby
// @access  Public
const getNearbyRestaurants = asyncHandler(async(req, res) => {
    const { lng, lat, maxDistance = 10000 } = req.query // maxDistance in meters

    if (!lng || !lat) {
        res.status(400)
        throw new Error('Please provide longitude and latitude')
    }

    const restaurants = await Restaurant.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                $maxDistance: parseInt(maxDistance),
            },
        },
        isOpen: true,
    }).populate('owner', 'name')

    res.json({
        success: true,
        count: restaurants.length,
        data: restaurants,
    })
})

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (Admin)
const createRestaurant = asyncHandler(async(req, res) => {
    const restaurant = await Restaurant.create(req.body)

    res.status(201).json({
        success: true,
        data: restaurant,
    })
})

// @desc    Create restaurant with account (Admin only)
// @route   POST /api/restaurants/create-with-account
// @access  Private (Admin)
const createRestaurantWithAccount = asyncHandler(async(req, res) => {
    const {
        // User credentials
        email,
        password,
        name: ownerName,
        phone: ownerPhone,
        // Restaurant info
        restaurantName,
        description,
        image,
        categories,
        address,
        lat,
        lng,
        restaurantPhone,
        restaurantEmail,
        openingHours,
        deliveryTime,
    } = req.body

    // Validate required fields
    if (!email || !password || !restaurantName || !address) {
        res.status(400)
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc')
    }

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error('Email đã tồn tại trong hệ thống')
    }

    // Create User account with restaurant role
    // ✅ KHÔNG hash password ở đây - để User model tự hash
    const user = await User.create({
        name: ownerName || restaurantName,
        email,
        password: password, // ✅ Giữ nguyên plain password
        phone: ownerPhone || restaurantPhone,
        role: 'restaurant',
        isActive: true,
    })

    // Create Restaurant
    const restaurantData = {
        name: restaurantName,
        description: description || '',
        image: image || '',
        owner: user._id,
        categories: categories || [],
        address,
        phone: restaurantPhone || ownerPhone,
        email: restaurantEmail || email,
        openingHours: openingHours || '8:00 - 22:00',
        deliveryTime: deliveryTime || '20-30',
        isOpen: true,
        isActive: true,
    }

    // Add location if lat/lng provided
    if (lat && lng) {
        restaurantData.location = {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
        }
    } else {
        // Default location (can be updated later)
        restaurantData.location = {
            type: 'Point',
            coordinates: [106.6297, 10.8231], // Default: Ho Chi Minh City center
        }
    }

    const restaurant = await Restaurant.create(restaurantData)

    // ✅ Update User with restaurantId
    await User.findByIdAndUpdate(user._id, { restaurantId: restaurant._id })

    const populatedRestaurant = await Restaurant.findById(restaurant._id)
        .populate('owner', 'name email phone')

    res.status(201).json({
        success: true,
        data: {
            restaurant: populatedRestaurant,
            credentials: {
                email: user.email,
                password: password, // Return plain password for admin to send to restaurant
                role: user.role,
            },
        },
        message: 'Tạo nhà hàng và tài khoản thành công',
    })
})

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant/Admin)
const updateRestaurant = asyncHandler(async(req, res) => {
    let restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    // Check permission
    if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized to update this restaurant')
    }

    // Parse JSON fields from FormData
    const updateData = {...req.body }

    // Parse categories if it's a string
    if (updateData.categories && typeof updateData.categories === 'string') {
        try {
            updateData.categories = JSON.parse(updateData.categories)
        } catch (e) {
            // If it's not JSON, split by comma
            updateData.categories = updateData.categories.split(',').map(c => c.trim())
        }
    }

    // Parse promo if it's a JSON string (object format)
    if (updateData.promo && typeof updateData.promo === 'string') {
        try {
            // Try to parse as JSON object
            const parsed = JSON.parse(updateData.promo)
            if (typeof parsed === 'object') {
                updateData.promo = parsed
            }
            // If it's just a string in quotes, keep as string
        } catch (e) {
            // If not JSON, keep as plain string (backward compatible)
            // Do nothing, updateData.promo already is string
        }
    }

    // Validate promo object structure if it's an object
    if (updateData.promo && typeof updateData.promo === 'object') {
        const { text, discountPercent, validUntil, minOrder } = updateData.promo
            // Ensure required fields
        if (!text) {
            updateData.promo.text = 'Khuyến mãi đặc biệt'
        }
        // Validate discountPercent
        if (discountPercent !== undefined) {
            updateData.promo.discountPercent = Math.min(100, Math.max(0, Number(discountPercent)))
        }
        // Parse validUntil as Date if it's a string
        if (validUntil && typeof validUntil === 'string') {
            updateData.promo.validUntil = new Date(validUntil)
        }
        // Ensure promo has an identifier so we can track usage per-promo
        if (!updateData.promo.promoId) {
            // generate a simple stable id (prefix + timestamp)
            updateData.promo.promoId = `PROMO_${Date.now()}`
        }
    }

    // Handle image upload - Cloudinary URL
    if (req.file) {
        updateData.image = req.file.path // Cloudinary URL
    }

    restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        updateData, {
            new: true,
            runValidators: true,
        }
    )

    res.json({
        success: true,
        data: restaurant,
    })
})

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Admin)
const deleteRestaurant = asyncHandler(async(req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    await restaurant.deleteOne()

    res.json({
        success: true,
        data: {},
    })
})

// @desc    Get restaurant menu (products)
// @route   GET /api/restaurants/:id/menu
// @access  Public
const getRestaurantMenu = asyncHandler(async(req, res) => {
    const Product = require('../Models/Product')

    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    const products = await Product.find({
            restaurant: req.params.id,
            isAvailable: true,
        })
        .populate('category', 'name')
        .sort('category')

    res.json({
        success: true,
        data: {
            restaurant,
            products,
        },
    })
})

// @desc    Get restaurant orders
// @route   GET /api/restaurants/:id/orders
// @access  Private (Restaurant/Admin)
const getRestaurantOrders = asyncHandler(async(req, res) => {
    const Order = require('../Models/Order')

    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    // Check permission
    if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized')
    }

    const { status, startDate, endDate } = req.query

    // Build base query for this restaurant
    let query = { restaurant: req.params.id }

    // Status filter if provided
    if (status) {
        query.status = status
    }

    // Date range filter (createdAt)
    if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) query.createdAt.$gte = new Date(startDate)
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            query.createdAt.$lte = end
        }
    }

    const orders = await Order.find(query)
        .populate('user', 'name phone')
        .populate('items.product', 'name price')
        .sort('-createdAt')

    res.json({
        success: true,
        count: orders.length,
        data: orders,
    })
})

// @desc    Toggle restaurant open status
// @route   PATCH /api/restaurants/:id/toggle-status
// @access  Private (Restaurant/Admin)
const toggleRestaurantStatus = asyncHandler(async(req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    // Check permission
    if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized')
    }

    restaurant.isOpen = !restaurant.isOpen
    await restaurant.save()

    res.json({
        success: true,
        data: restaurant,
    })
})

// @desc    Get restaurant statistics
// @route   GET /api/restaurants/:id/stats
// @access  Private (Restaurant/Admin)
const getRestaurantStats = asyncHandler(async(req, res) => {
    const Order = require('../Models/Order')
    const Product = require('../Models/Product')

    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    // Check permission
    if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized')
    }

    // Get date range from query params
    const { startDate, endDate } = req.query
    const dateFilter = {}
    if (startDate || endDate) {
        dateFilter.createdAt = {}
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            dateFilter.createdAt.$lte = end
        }
    }

    // Total orders
    const totalOrders = await Order.countDocuments({
        restaurant: req.params.id,
        ...dateFilter,
    })

    // Pending orders
    const pendingOrders = await Order.countDocuments({
        restaurant: req.params.id,
        status: { $in: ['pending', 'confirmed', 'preparing'] },
    })

    // Orders by status
    const ordersByStatus = await Order.aggregate([{
            $match: {
                restaurant: restaurant._id,
                ...dateFilter,
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ])

    const statusBreakdown = {}
    ordersByStatus.forEach(item => {
        statusBreakdown[item._id] = item.count
    })

    // Total revenue
    const revenueData = await Order.aggregate([{
            $match: {
                restaurant: restaurant._id,
                status: 'delivered',
                ...dateFilter,
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' },
                count: { $sum: 1 },
            },
        },
    ])

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0
    const deliveredOrders = revenueData.length > 0 ? revenueData[0].count : 0
    const avgOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0

    // Calculate revenue change (compare with previous period)
    let revenueChange = 0
    if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

        const prevStart = new Date(start)
        prevStart.setDate(prevStart.getDate() - daysDiff)
        const prevEnd = new Date(start)
        prevEnd.setDate(prevEnd.getDate() - 1)

        const prevRevenueData = await Order.aggregate([{
                $match: {
                    restaurant: restaurant._id,
                    status: 'delivered',
                    createdAt: {
                        $gte: prevStart,
                        $lte: prevEnd,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ])

        const prevRevenue = prevRevenueData.length > 0 ? prevRevenueData[0].total : 0
        if (prevRevenue > 0) {
            revenueChange = ((totalRevenue - prevRevenue) / prevRevenue) * 100
        }
    }

    // Total products
    const totalProducts = await Product.countDocuments({
        restaurant: req.params.id,
    })

    // Today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await Order.countDocuments({
        restaurant: req.params.id,
        createdAt: { $gte: today },
    })

    // Today's revenue
    const todayRevenueData = await Order.aggregate([{
            $match: {
                restaurant: restaurant._id,
                status: 'delivered',
                createdAt: { $gte: today },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' },
            },
        },
    ])

    const todayRevenue =
        todayRevenueData.length > 0 ? todayRevenueData[0].total : 0

    res.json({
        success: true,
        data: {
            totalOrders,
            pendingOrders,
            totalRevenue,
            totalProducts,
            todayOrders,
            todayRevenue,
            avgOrderValue: Math.round(avgOrderValue),
            revenueChange: Math.round(revenueChange * 100) / 100,
            ordersByStatus: statusBreakdown,
        },
    })
})

module.exports = {
    getRestaurants,
    getRestaurantById,
    getNearbyRestaurants,
    createRestaurant,
    createRestaurantWithAccount,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMenu,
    getRestaurantOrders,
    toggleRestaurantStatus,
    getRestaurantStats,
}