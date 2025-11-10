/**
 * DRONE DELIVERY TIMEOUT ROUTES
 * API endpoints để test và quản lý drone delivery timeout
 */

const express = require('express');
const router = express.Router();
const {
    simulateDroneArrival,
    simulateCustomerConfirmation,
    getDeliveryStatus
} = require('../Controllers/droneSimulationController');

// Simulation routes for testing
router.post('/arrive/:orderId', simulateDroneArrival);
router.post('/confirm/:orderId', simulateCustomerConfirmation);
router.get('/status/:orderId', getDeliveryStatus);

module.exports = router;