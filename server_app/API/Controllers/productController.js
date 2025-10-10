const asyncHandler = require('../Middleware/asyncHandler')
const Product = require('../Models/Product')

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async(req, res) => {
    const { search, category, restaurant, sortBy, minPrice, maxPrice } = req.query

    let query = { isAvailable: true }

    // Search filter
    if (search) {
        query.name = { $regex: search, $options: 'i' }
    }

    // Category filter
    if (category) {
        query.category = category
    }

    // Restaurant filter
    if (restaurant) {
        query.restaurant = restaurant
    }

    // Price range filter
    if (minPrice || maxPrice) {
        query.price = {}
        if (minPrice) query.price.$gte = Number(minPrice)
        if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sorting
    let sort = '-createdAt'
    if (sortBy === 'price-asc') sort = 'price'
    if (sortBy === 'price-desc') sort = '-price'
    if (sortBy === 'rating') sort = '-rating'
    if (sortBy === 'popular') sort = '-soldCount'

    const products = await Product.find(query)
        .populate('category', 'name')
        .populate('restaurant', 'name image rating')
        .sort(sort)

    res.json({
        success: true,
        count: products.length,
        data: products,
    })
})

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async(req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name')
        .populate('restaurant', 'name image address phone rating')

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    res.json({
        success: true,
        data: product,
    })
})

// @desc    Create product
// @route   POST /api/products
// @access  Private (Restaurant/Admin)
const createProduct = asyncHandler(async(req, res) => {
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        data: product,
    })
})

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Restaurant/Admin)
const updateProduct = asyncHandler(async(req, res) => {
    let product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    res.json({
        success: true,
        data: product,
    })
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Restaurant/Admin)
const deleteProduct = asyncHandler(async(req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    await product.deleteOne()

    res.json({
        success: true,
        data: {},
    })
})

// @desc    Get popular products
// @route   GET /api/products/popular
// @access  Public
const getPopularProducts = asyncHandler(async(req, res) => {
    const products = await Product.find({ isAvailable: true })
        .populate('category', 'name')
        .populate('restaurant', 'name image rating')
        .sort('-soldCount')
        .limit(8)

    res.json({
        success: true,
        data: products,
    })
})

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getPopularProducts,
}