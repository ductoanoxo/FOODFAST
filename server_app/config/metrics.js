// Prometheus Metrics Configuration for FoodFast
const promClient = require('prom-client');

// Create a Registry để lưu tất cả metrics
const register = new promClient.Registry();

// Thêm default metrics (CPU, Memory, Event Loop, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom Metrics cho FoodFast

// Counter: Tổng số HTTP requests
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Histogram: Thời gian response của HTTP requests
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

// Gauge: Số lượng orders đang active
const activeOrdersGauge = new promClient.Gauge({
  name: 'active_orders_count',
  help: 'Number of active orders in the system',
  registers: [register],
});

// Gauge: Số lượng drones available
const availableDronesGauge = new promClient.Gauge({
  name: 'available_drones_count',
  help: 'Number of available drones',
  registers: [register],
});

// Gauge: Số lượng drones đang delivering
const deliveringDronesGauge = new promClient.Gauge({
  name: 'delivering_drones_count',
  help: 'Number of drones currently delivering',
  registers: [register],
});

// Gauge: Tổng số users
const totalUsersGauge = new promClient.Gauge({
  name: 'total_users_count',
  help: 'Total number of registered users',
  registers: [register],
});

// Gauge: Tổng số restaurants
const totalRestaurantsGauge = new promClient.Gauge({
  name: 'total_restaurants_count',
  help: 'Total number of registered restaurants',
  registers: [register],
});

// Counter: Tổng số orders theo status
const ordersStatusCounter = new promClient.Counter({
  name: 'orders_status_total',
  help: 'Total number of orders by status',
  labelNames: ['status'],
  registers: [register],
});

// Histogram: Thời gian xử lý payment
const paymentDuration = new promClient.Histogram({
  name: 'payment_duration_seconds',
  help: 'Duration of payment processing in seconds',
  labelNames: ['payment_method', 'status'],
  buckets: [0.5, 1, 2, 3, 5, 10],
  registers: [register],
});

// Gauge: MongoDB connections
const mongoConnectionsGauge = new promClient.Gauge({
  name: 'mongodb_connections_current',
  help: 'Current number of MongoDB connections',
  registers: [register],
});

// Counter: Database operations
const dbOperationsCounter = new promClient.Counter({
  name: 'db_operations_total',
  help: 'Total number of database operations',
  labelNames: ['operation', 'collection'],
  registers: [register],
});

// Middleware để track HTTP requests
function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = Date.now();
  let metricsRecorded = false;
  
  const recordMetrics = function() {
    if (metricsRecorded) return; // Prevent double recording
    metricsRecorded = true;
    
    try {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      
      // Lấy route path
      let route = req.path;
      if (req.route && req.route.path) {
        route = req.baseUrl ? req.baseUrl + req.route.path : req.route.path;
      } else if (req.baseUrl) {
        route = req.baseUrl + req.path;
      }
      
      const status = res.statusCode;
      const method = req.method;
      
      // Record metrics
      httpRequestsTotal.inc({ method, route, status });
      httpRequestDuration.observe({ method, route, status }, duration);
    } catch (error) {
      console.error('Error recording metrics:', error);
    }
  };
  
  // Record on finish event (more reliable)
  res.on('finish', recordMetrics);
  
  next();
}

// Function để update business metrics
async function updateBusinessMetrics(models) {
  try {
    // Update active orders count
    if (models.Order) {
      const activeOrders = await models.Order.countDocuments({
        status: { $in: ['pending', 'preparing', 'ready', 'delivering'] }
      });
      activeOrdersGauge.set(activeOrders);
    }
    
    // Update drone metrics
    if (models.Drone) {
      const availableDrones = await models.Drone.countDocuments({ status: 'available' });
      const deliveringDrones = await models.Drone.countDocuments({ status: 'delivering' });
      availableDronesGauge.set(availableDrones);
      deliveringDronesGauge.set(deliveringDrones);
    }
    
    // Update user count
    if (models.User) {
      const totalUsers = await models.User.countDocuments();
      totalUsersGauge.set(totalUsers);
    }
    
    // Update restaurant count
    if (models.Restaurant) {
      const totalRestaurants = await models.Restaurant.countDocuments();
      totalRestaurantsGauge.set(totalRestaurants);
    }
  } catch (error) {
    console.error('Error updating business metrics:', error);
  }
}

// Function để track order status changes
function trackOrderStatus(status) {
  ordersStatusCounter.inc({ status });
}

// Function để track payment duration
function trackPaymentDuration(duration, paymentMethod, status) {
  paymentDuration.observe({ payment_method: paymentMethod, status }, duration);
}

// Function để track DB operations
function trackDBOperation(operation, collection) {
  dbOperationsCounter.inc({ operation, collection });
}

// Function để update MongoDB connection metrics
function updateMongoMetrics(mongoose) {
  if (mongoose && mongoose.connection) {
    const connectionCount = mongoose.connection.readyState === 1 ? 1 : 0;
    mongoConnectionsGauge.set(connectionCount);
  }
}

module.exports = {
  register,
  metricsMiddleware,
  updateBusinessMetrics,
  trackOrderStatus,
  trackPaymentDuration,
  trackDBOperation,
  updateMongoMetrics,
  metrics: {
    httpRequestsTotal,
    httpRequestDuration,
    activeOrdersGauge,
    availableDronesGauge,
    deliveringDronesGauge,
    totalUsersGauge,
    totalRestaurantsGauge,
    ordersStatusCounter,
    paymentDuration,
    mongoConnectionsGauge,
    dbOperationsCounter,
  }
};
