const logger = require('../Utils/logger')

const errorHandler = (err, req, res) => {
    logger.error(err.message, { stack: err.stack })

    let error = {...err }
    error.message = err.message

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found'
        error = { message, statusCode: 404 }
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered'
        error = { message, statusCode: 400 }
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message)
        error = { message, statusCode: 400 }
    }

    res.status(error.statusCode || err.statusCode || 500).json({
        success: false,
        error: error.message || err.message || 'Server Error',
    })
}

module.exports = { errorHandler }