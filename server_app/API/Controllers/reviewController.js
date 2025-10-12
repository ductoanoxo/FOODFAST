const asyncHandler = require('../Middleware/asyncHandler')
const Review = require('../Models/Review')
const Product = require('../Models/Product')

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { product, rating, comment, order, images, isVerified } = req.body

    // Cho phép đánh giá nhiều lần - không check duplicate nữa
    const review = await Review.create({
        user: req.user._id,
        product,
        order,
        rating,
        comment,
        images: images || [],
        isVerified: isVerified || false,
    })

    // Update product rating
    const reviews = await Review.find({ product })
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / reviews.length

    await Product.findByIdAndUpdate(product, {
        rating: avgRating.toFixed(1),
        reviewCount: reviews.length,
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

// @desc    Get restaurant reviews
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getRestaurantReviews = asyncHandler(async (req, res) => {
    const Product = require('../Models/Product')
    
    // Lấy tất cả sản phẩm của nhà hàng
    const products = await Product.find({ restaurant: req.params.restaurantId })
    const productIds = products.map(p => p._id)
    
    // Lấy tất cả reviews của các sản phẩm đó
    const reviews = await Review.find({ product: { $in: productIds } })
        .populate('user', 'name avatar')
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

    // Allow user to update their own review OR restaurant owner to add reply
    const isOwner = review.user.toString() === req.user._id.toString();
    const isRestaurantReply = req.body.restaurantReply !== undefined;
    
    if (!isOwner && !isRestaurantReply) {
        res.status(403)
        throw new Error('Not authorized')
    }

    // Nếu là restaurant reply, chỉ cho phép update restaurantReply và repliedAt
    if (isRestaurantReply && !isOwner) {
        const updateData = {
            restaurantReply: req.body.restaurantReply,
            repliedAt: req.body.repliedAt || new Date(),
        };
        
        review = await Review.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        })
        .populate('user', 'name avatar')
        .populate('product', 'name image');
    } else {
        // User update own review
        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        .populate('user', 'name avatar')
        .populate('product', 'name image');

        // Update product rating nếu có thay đổi rating
        if (req.body.rating) {
            const reviews = await Review.find({ product: review.product })
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
            const avgRating = totalRating / reviews.length

            await Product.findByIdAndUpdate(review.product, {
                rating: avgRating.toFixed(1),
                reviewCount: reviews.length,
            })
        }
    }

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
    const reviews = await Review.find({ product: productId })

    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
        const avgRating = totalRating / reviews.length

        await Product.findByIdAndUpdate(productId, {
            rating: avgRating.toFixed(1),
            reviewCount: reviews.length,
        })
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            reviewCount: 0,
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
    getRestaurantReviews,
    updateReview,
    deleteReview,
}
