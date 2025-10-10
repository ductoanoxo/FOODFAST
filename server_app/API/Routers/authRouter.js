const express = require('express')
const router = express.Router()
const {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
} = require('../Controllers/authController')
const { protect } = require('../Middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.post('/logout', protect, logout)
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

module.exports = router