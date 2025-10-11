const asyncHandler = require('../Middleware/asyncHandler')
const mongoose = require('mongoose')

// Review Schema (embedded in Product or separate collection)
const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500,
        },
        images: [String],
    },
    {
        timestamps: true,
    }
)

const Review = mongoose.model('Review', reviewSchema)

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { product, rating, comment, order, images } = req.body
    const Product = require('../Models/Product')

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
        user: req.user._id,
        product,
    })

    if (existingReview) {
        res.status(400)
        throw new Error('You already reviewed this product')
    }

    const review = await Review.create({
        user: req.user._id,
        product,
        order,
        rating,
        comment,
        images,
    })

    // Update product rating
    const reviews = await Review.find({ product })
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / reviews.length

    await Product.findByIdAndUpdate(product, {
        rating: avgRating.toFixed(1),
        totalReviews: reviews.length,
    })

    const populatedReview = await Review.findById(review._id).populate(
        'user',
        'name avatar'
    )

    res.status(201).json({
        success: true,
        data: populatedReview,
    })
})

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId })
        .populate('user', 'name avatar')
        .sort('-createdAt')

    res.json({
        success: true,
        count: reviews.length,
        data: reviews,
    })
})

// @desc    Get user reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.params.userId })
        .populate('product', 'name image')
        .sort('-createdAt')

    res.json({
        success: true,
        count: reviews.length,
        data: reviews,
    })
})

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
    let review = await Review.findById(req.params.id)

    if (!review) {
        res.status(404)
        throw new Error('Review not found')
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized')
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('user', 'name avatar')

    // Update product rating
    const Product = require('../Models/Product')
    const reviews = await Review.find({ product: review.product })
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / reviews.length

    await Product.findByIdAndUpdate(review.product, {
        rating: avgRating.toFixed(1),
    })

    res.json({
        success: true,
        data: review,
    })
})

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)

    if (!review) {
        res.status(404)
        throw new Error('Review not found')
    }

    // Check ownership or admin
    if (
        review.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403)
        throw new Error('Not authorized')
    }

    const productId = review.product

    await review.deleteOne()

    // Update product rating
    const Product = require('../Models/Product')
    const reviews = await Review.find({ product: productId })

    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
        const avgRating = totalRating / reviews.length

        await Product.findByIdAndUpdate(productId, {
            rating: avgRating.toFixed(1),
            totalReviews: reviews.length,
        })
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            totalReviews: 0,
        })
    }

    res.json({
        success: true,
        data: {},
    })
})

module.exports = {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    Review,
}
