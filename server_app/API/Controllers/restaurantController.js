const asyncHandler = require('../Middleware/asyncHandler')
const Restaurant = require('../Models/Restaurant')

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
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
        .populate('owner', 'name email')
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
const getRestaurantById = asyncHandler(async (req, res) => {
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
const getNearbyRestaurants = asyncHandler(async (req, res) => {
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
const createRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create(req.body)

    res.status(201).json({
        success: true,
        data: restaurant,
    })
})

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant/Admin)
const updateRestaurant = asyncHandler(async (req, res) => {
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

    restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
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
const deleteRestaurant = asyncHandler(async (req, res) => {
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
const getRestaurantMenu = asyncHandler(async (req, res) => {
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
const getRestaurantOrders = asyncHandler(async (req, res) => {
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

    const { status } = req.query
    let query = { restaurant: req.params.id }

    if (status) {
        query.status = status
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
const toggleRestaurantStatus = asyncHandler(async (req, res) => {
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
const getRestaurantStats = asyncHandler(async (req, res) => {
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

    // Total orders
    const totalOrders = await Order.countDocuments({
        restaurant: req.params.id,
    })

    // Pending orders
    const pendingOrders = await Order.countDocuments({
        restaurant: req.params.id,
        status: { $in: ['pending', 'confirmed', 'preparing'] },
    })

    // Total revenue
    const revenueData = await Order.aggregate([
        {
            $match: {
                restaurant: restaurant._id,
                status: 'delivered',
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' },
            },
        },
    ])

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0

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
    const todayRevenueData = await Order.aggregate([
        {
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
        },
    })
})

module.exports = {
    getRestaurants,
    getRestaurantById,
    getNearbyRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMenu,
    getRestaurantOrders,
    toggleRestaurantStatus,
    getRestaurantStats,
}
