const express = require('express')
const router = express.Router()
const asyncHandler = require('../Middleware/asyncHandler')
const Category = require('../Models/Category')

// Get all categories
router.get('/', asyncHandler(async(req, res) => {
    const categories = await Category.find({ isActive: true })

    res.json({
        success: true,
        data: categories,
    })
}))

module.exports = router