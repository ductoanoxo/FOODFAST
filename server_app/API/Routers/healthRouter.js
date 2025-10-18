const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get('/health', async(req, res) => {
    try {
        const health = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                readyState: mongoose.connection.readyState
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB'
            }
        };

        // If database is not connected, return 503
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                ...health,
                status: 'DEGRADED'
            });
        }

        res.status(200).json(health);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe endpoint
 * @access  Public
 */
router.get('/health/ready', async(req, res) => {
    if (mongoose.connection.readyState === 1) {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'not ready' });
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe endpoint
 * @access  Public
 */
router.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

module.exports = router;