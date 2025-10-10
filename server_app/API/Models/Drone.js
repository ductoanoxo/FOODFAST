const mongoose = require('mongoose')

const droneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['available', 'busy', 'charging', 'maintenance', 'offline'],
        default: 'available',
    },
    batteryLevel: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    homeLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    maxRange: {
        type: Number,
        default: 10, // km
    },
    maxWeight: {
        type: Number,
        default: 5, // kg
    },
    speed: {
        type: Number,
        default: 60, // km/h
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    totalFlights: {
        type: Number,
        default: 0,
    },
    totalDistance: {
        type: Number,
        default: 0,
    },
    lastMaintenanceDate: {
        type: Date,
        default: Date.now,
    },
    nextMaintenanceDate: Date,
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
})

droneSchema.index({ currentLocation: '2dsphere' })

module.exports = mongoose.model('Drone', droneSchema)