const express = require('express')
const router = express.Router()
const {
    getDrones,
    getDroneById,
    createDrone,
    updateDrone,
    deleteDrone,
    updateDroneLocation,
    updateDroneStatus,
    updateDroneBattery,
    assignDroneToOrder,
    getNearbyDrones,
    getDroneStats,
} = require('../Controllers/droneController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.get('/nearby', protect, authorize('admin'), getNearbyDrones)
router.get('/', getDrones)
router.post('/', protect, authorize('admin'), createDrone)
router.get('/:id', getDroneById)
router.put('/:id', protect, authorize('drone', 'admin'), updateDrone)
router.delete('/:id', protect, authorize('admin'), deleteDrone)
router.patch('/:id/location', protect, authorize('drone', 'admin'), updateDroneLocation)
router.patch('/:id/status', protect, authorize('drone', 'admin'), updateDroneStatus)
router.patch('/:id/battery', protect, authorize('drone', 'admin'), updateDroneBattery)
router.post('/:id/assign', protect, authorize('admin'), assignDroneToOrder)
router.get('/:id/stats', protect, authorize('admin'), getDroneStats)

module.exports = router