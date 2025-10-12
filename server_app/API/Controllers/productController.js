const asyncHandler = require('../Middleware/asyncHandler')
const Product = require('../Models/Product')
const Promotion = require('../Models/Promotion')

// @desc    Get all products or restaurant products
// @route   GET /api/products or GET /api/products/restaurant
// @access  Public / Private (Restaurant)
const getProducts = asyncHandler(async(req, res) => {
    const { search, category, restaurant, sortBy, minPrice, maxPrice } = req.query

    let query = {}

    // If restaurant role, only get their products
    if (req.user && req.user.role === 'restaurant') {
        if (!req.user.restaurantId) {
            res.status(400)
            throw new Error('Restaurant ID not found for this user')
        }
        query.restaurant = req.user.restaurantId
    } else {
        // Public access - only show available products
        query.isAvailable = true
    }

    // Search filter
    if (search) {
        query.name = { $regex: search, $options: 'i' }
    }

    // Category filter
    if (category) {
        query.category = category
    }

    // Restaurant filter (for public access)
    if (restaurant && !req.user) {
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

    // Apply active promotions to products
    const now = new Date()
    const productsWithPromotions = await Promise.all(products.map(async (product) => {
        const productObj = product.toObject()
        
        // Find active promotion for this product's category
        const promotion = await Promotion.findOne({
            restaurant: product.restaurant._id,
            category: product.category._id,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        })

        if (promotion) {
            const originalPrice = productObj.price
            const discountAmount = (originalPrice * promotion.discountPercent) / 100
            const finalPrice = originalPrice - discountAmount

            productObj.promotion = {
                id: promotion._id,
                name: promotion.name,
                discountPercent: promotion.discountPercent,
                originalPrice: originalPrice,
                finalPrice: Math.round(finalPrice),
            }
            productObj.price = Math.round(finalPrice)
        }

        return productObj
    }))

    res.json({
        success: true,
        count: productsWithPromotions.length,
        data: productsWithPromotions,
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

    const productObj = product.toObject()

    // Check for active promotion
    const now = new Date()
    const promotion = await Promotion.findOne({
        restaurant: product.restaurant._id,
        category: product.category._id,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    })

    if (promotion) {
        const originalPrice = productObj.price
        const discountAmount = (originalPrice * promotion.discountPercent) / 100
        const finalPrice = originalPrice - discountAmount

        productObj.promotion = {
            id: promotion._id,
            name: promotion.name,
            discountPercent: promotion.discountPercent,
            originalPrice: originalPrice,
            finalPrice: Math.round(finalPrice),
        }
        productObj.price = Math.round(finalPrice)
    }

    res.json({
        success: true,
        data: productObj,
    })
})

// @desc    Create product
// @route   POST /api/products
// @access  Private (Restaurant/Admin)
const createProduct = asyncHandler(async(req, res) => {
    // Get restaurant ID from authenticated user
    if (!req.user.restaurantId) {
        res.status(400)
        throw new Error('Restaurant ID not found for this user')
    }

    const productData = {
        ...req.body,
        restaurant: req.user.restaurantId,
    }

    // Handle image upload
    if (req.file) {
        productData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    }

    const product = await Product.create(productData)

    // Populate the product before returning
    await product.populate('category', 'name')
    await product.populate('restaurant', 'name image rating')

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

    // Check if user owns this product
    if (req.user.role === 'restaurant' && 
        product.restaurant.toString() !== req.user.restaurantId.toString()) {
        res.status(403)
        throw new Error('Not authorized to update this product')
    }

    const updateData = { ...req.body }

    // Only update image if new file is uploaded
    if (req.file) {
        updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    } else {
        // Don't update image field if no new file - remove it from updateData
        delete updateData.image
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    })
    .populate('category', 'name')
    .populate('restaurant', 'name image rating')

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

    // Apply active promotions to popular products (same logic as getProducts)
    const now = new Date()
    const productsWithPromotions = await Promise.all(products.map(async (product) => {
        const productObj = product.toObject()

        // Find active promotion for this product's category
        const promotion = await Promotion.findOne({
            restaurant: product.restaurant._id,
            category: product.category._id,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        })

        if (promotion) {
            const originalPrice = productObj.price
            const discountAmount = (originalPrice * promotion.discountPercent) / 100
            const finalPrice = originalPrice - discountAmount

            productObj.promotion = {
                id: promotion._id,
                name: promotion.name,
                discountPercent: promotion.discountPercent,
                originalPrice: originalPrice,
                finalPrice: Math.round(finalPrice),
            }
            productObj.price = Math.round(finalPrice)
        }

        return productObj
    }))

    res.json({
        success: true,
        data: productsWithPromotions,
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