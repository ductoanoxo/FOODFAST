const express = require('express')
const router = express.Router()
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    getUserOrders,
    checkEmailExists,
} = require('../Controllers/userController')
const { protect, authorize } = require('../Middleware/authMiddleware')

router.get('/check-email', checkEmailExists)
router.get('/stats', protect, authorize('admin'), getUserStats)
router.get('/', protect, authorize('admin'), getUsers)
router.get('/:id', protect, authorize('admin'), getUserById)
router.put('/:id', protect, authorize('admin'), updateUser)
router.delete('/:id', protect, authorize('admin'), deleteUser)
router.get('/:id/orders', protect, getUserOrders)

module.exports = router