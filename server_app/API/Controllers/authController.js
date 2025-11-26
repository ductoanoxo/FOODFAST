const jwt = require('jsonwebtoken')
const asyncHandler = require('../Middleware/asyncHandler')
const User = require('../Models/User')

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async(req, res) => {
    const { name, email, password, phone } = req.body

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone,
    })

    if (user) {
        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                address: user.address,
            },
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc    Login userdsdssdsdsdsdsdsdsdsds
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email }).select('+password')

    if (user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                address: user.address,
                restaurantId: user.restaurantId,
            },
            token: generateToken(user._id),
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

// @desc    Get current user
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id)
        .populate('restaurantId', 'name description address phone email openingHours isOpen rating totalReviews image')

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const userData = user.toObject()

    res.json({
        success: true,
        data: {
            ...userData,
            restaurant: userData.restaurantId || null, // Add restaurant info if exists
        },
    })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.phone = req.body.phone || user.phone
        user.address = req.body.address || user.address
        user.avatar = req.body.avatar || user.avatar

        if (req.body.password) {
            user.password = req.body.password
        }

        const updatedUser = await user.save()

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                address: updatedUser.address,
            },
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async(req, res) => {
    res.json({
        success: true,
        data: {},
        message: 'Logout successful',
    })
})

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
}