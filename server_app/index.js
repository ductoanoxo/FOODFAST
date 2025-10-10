const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const { errorHandler } = require('./API/Middleware/errorMiddleware')
const logger = require('./API/Utils/logger')
const path = require('path')

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Connect to MongoDB
connectDB()

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        process.env.RESTAURANT_URL || 'http://localhost:3001',
        process.env.ADMIN_URL || 'http://localhost:3002',
        process.env.DRONE_URL || 'http://localhost:3003',
    ],
    credentials: true,
}))
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'FoodFast Drone Delivery API',
        version: '1.0.0',
        status: 'running',
    })
})

app.use('/api/auth', require('./API/Routers/authRouter'))
app.use('/api/users', require('./API/Routers/userRouter'))
app.use('/api/products', require('./API/Routers/productRouter'))
app.use('/api/categories', require('./API/Routers/categoryRouter'))
app.use('/api/restaurants', require('./API/Routers/restaurantRouter'))
app.use('/api/orders', require('./API/Routers/orderRouter'))
app.use('/api/drones', require('./API/Routers/droneRouter'))
app.use('/api/payment', require('./API/Routers/paymentRouter'))
app.use('/api/reviews', require('./API/Routers/reviewRouter'))
app.use('/api/upload', require('./API/Routers/uploadRouter'))

// Error Handler
app.use(errorHandler)

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})

// Socket.io setup
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
    })

    // Join order room
    socket.on('join-order', (orderId) => {
        socket.join(`order-${orderId}`)
        console.log(`Socket ${socket.id} joined order-${orderId}`)
    })

    // Join drone room
    socket.on('join-drone', (droneId) => {
        socket.join(`drone-${droneId}`)
        console.log(`Socket ${socket.id} joined drone-${droneId}`)
    })
})

// Make io accessible to routes
app.set('io', io)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err)
    server.close(() => process.exit(1))
})

module.exports = { app, io }