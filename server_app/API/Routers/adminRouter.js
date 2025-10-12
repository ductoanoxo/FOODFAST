const express = require('express');
const router = express.Router();
const {
    getPendingOrders,
    getAvailableDrones,
    assignDrone,
    reassignOrder,
    getFleetStats,
    getFleetMap,
    getDronePerformance,
} = require('../Controllers/adminController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

// Order management
router.get('/orders/pending', getPendingOrders);

// Drone management
router.get('/drones/available', getAvailableDrones);
router.get('/drones/performance', getDronePerformance);

// Assignment
router.post('/assign-drone', assignDrone);
router.post('/reassign-order', reassignOrder);

// Fleet monitoring
router.get('/fleet/stats', getFleetStats);
router.get('/fleet/map', getFleetMap);

module.exports = router;