const asyncHandler = require('../Middleware/asyncHandler')
const Category = require('../Models/Category')
const Product = require('../Models/Product')
const Restaurant = require('../Models/Restaurant')

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort('name')

    res.json({
        success: true,
        count: categories.length,
        data: categories,
    })
})

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    res.json({
        success: true,
        data: category,
    })
})

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create(req.body)

    res.status(201).json({
        success: true,
        data: category,
    })
})

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
    let category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    res.json({
        success: true,
        data: category,
    })
})

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    await category.deleteOne()

    res.json({
        success: true,
        data: {},
    })
})

// @desc    Get category products
// @route   GET /api/categories/:id/products
// @access  Public
const getCategoryProducts = asyncHandler(async (req, res) => {
    const Product = require('../Models/Product')

    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    const products = await Product.find({
        category: req.params.id,
        isAvailable: true,
    })
        .populate('restaurant', 'name image rating')
        .sort('-soldCount')

    res.json({
        success: true,
        data: {
            category,
            products,
        },
    })
})

// @desc    Get categories with products for a restaurant
// @route   GET /api/categories/restaurant/with-products
// @access  Private (Restaurant)
const getCategoriesWithProducts = asyncHandler(async (req, res) => {
    // Get restaurant from authenticated user
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
    
    if (!restaurant) {
        res.status(404)
        throw new Error('Restaurant not found')
    }

    // Get all categories that have products from this restaurant
    const products = await Product.find({ 
        restaurant: restaurant._id 
    }).distinct('category')

    const categories = await Category.find({
        _id: { $in: products }
    }).sort('name')

    res.json({
        success: true,
        count: categories.length,
        data: categories,
    })
})

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
    getCategoriesWithProducts,
}
