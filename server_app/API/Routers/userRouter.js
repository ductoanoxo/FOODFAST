const express = require('express')
const router = express.Router()
const asyncHandler = require('../Middleware/asyncHandler')
const User = require('../Models/User')
const { protect, authorize } = require('../Middleware/authMiddleware')

// Get all users (Admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async(req, res) => {
    const users = await User.find({}).select('-password')

    res.json({
        success: true,
        data: users,
    })
}))

module.exports = router