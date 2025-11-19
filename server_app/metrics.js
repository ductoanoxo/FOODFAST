/**
 * Prometheus Metrics Configuration
 * Export metrics cho monitoring với Prometheus/Grafana
 */

const promClient = require('prom-client');

// Tạo Registry
const register = new promClient.Registry();

// Thêm default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics cho business logic
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeOrders = new promClient.Gauge({
    name: 'foodfast_active_orders',
    help: 'Number of active orders'
});

const droneStatus = new promClient.Gauge({
    name: 'foodfast_drone_status',
    help: 'Drone status (available, delivering, charging)',
    labelNames: ['status']
});

const databaseConnections = new promClient.Gauge({
    name: 'foodfast_database_connections',
    help: 'Number of database connections'
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeOrders);
register.registerMetric(droneStatus);
register.registerMetric(databaseConnections);

// Middleware để track HTTP requests
const requestMetricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;

        httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode },
            duration
        );

        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });
    });

    next();
};

// Function để update business metrics
const updateBusinessMetrics = async(mongoose) => {
    try {
        // Update active orders count
        if (mongoose.models.Order) {
            const activeOrderCount = await mongoose.models.Order.countDocuments({
                status: { $in: ['pending', 'confirmed', 'preparing', 'delivering'] }
            });
            activeOrders.set(activeOrderCount);
        }

        // Update drone status
        if (mongoose.models.Drone) {
            const drones = await mongoose.models.Drone.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            drones.forEach(({ _id, count }) => {
                droneStatus.set({ status: _id }, count);
            });
        }

        // Update database connections
        databaseConnections.set(mongoose.connection.readyState);
    } catch (error) {
        console.error('Error updating business metrics:', error);
    }
};

module.exports = {
    register,
    requestMetricsMiddleware,
    updateBusinessMetrics,
    metrics: {
        httpRequestDuration,
        httpRequestTotal,
        activeOrders,
        droneStatus,
        databaseConnections
    }
};