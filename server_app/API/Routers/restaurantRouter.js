const express = require('express')
const router = express.Router()
const asyncHandler = require('../Middleware/asyncHandler')
const Restaurant = require('../Models/Restaurant')

// Get all restaurants
router.get('/', asyncHandler(async(req, res) => {
    const restaurants = await Restaurant.find({ isActive: true })
        .populate('owner', 'name email phone')
        .sort('-rating')

    res.json({
        success: true,
        data: restaurants,
    })
}))

// Get restaurant by ID
router.get('/:id', asyncHandler(async(req, res) => {
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
}))

module.exports = router