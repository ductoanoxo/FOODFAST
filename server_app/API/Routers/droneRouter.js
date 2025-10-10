const express = require('express')
const router = express.Router()
const asyncHandler = require('../Middleware/asyncHandler')
const Drone = require('../Models/Drone')
const { protect, authorize } = require('../Middleware/authMiddleware')

// Get all drones
router.get('/', protect, asyncHandler(async(req, res) => {
    const drones = await Drone.find({ isActive: true })

    res.json({
        success: true,
        data: drones,
    })
}))

// Get drone by ID
router.get('/:id', protect, asyncHandler(async(req, res) => {
    const drone = await Drone.findById(req.params.id)
        .populate('currentOrder', 'orderNumber status')

    if (!drone) {
        res.status(404)
        throw new Error('Drone not found')
    }

    res.json({
        success: true,
        data: drone,
    })
}))

// Update drone location
router.patch('/:id/location', protect, authorize('drone', 'admin'), asyncHandler(async(req, res) => {
    const { coordinates } = req.body

    const drone = await Drone.findByIdAndUpdate(
        req.params.id, {
            currentLocation: {
                type: 'Point',
                coordinates,
            },
        }, { new: true }
    )

    // Emit socket event for real-time tracking
    const io = req.app.get('io')
    io.to(`drone-${drone._id}`).emit('drone-location-updated', {
        droneId: drone._id,
        location: drone.currentLocation,
    })

    res.json({
        success: true,
        data: drone,
    })
}))

module.exports = router