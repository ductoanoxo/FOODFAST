const Voucher = require('../Models/Voucher')
const VoucherUsage = require('../Models/VoucherUsage')
const Restaurant = require('../Models/Restaurant')

// @desc    Get all vouchers for a restaurant
// @route   GET /api/vouchers
// @access  Private (Restaurant Owner)
const getVouchers = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        if (!restaurant) {
            return res.status(404).json({ message: 'Không tìm thấy nhà hàng' })
        }

        const vouchers = await Voucher.find({ restaurant: restaurant._id })
            .sort({ createdAt: -1 })
        
        res.json({
            success: true,
            data: vouchers,
        })
    } catch (error) {
        console.error('Get vouchers error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// @desc    Get public vouchers for a restaurant (for customers)
// @route   GET /api/vouchers/public/:restaurantId
// @access  Public
const getPublicVouchers = async (req, res) => {
    try {
        const { restaurantId } = req.params
        const now = new Date()

        const vouchers = await Voucher.find({
            restaurant: restaurantId,
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                { maxUsage: null },
                { $expr: { $lt: ['$usageCount', '$maxUsage'] } },
            ],
        }).select('-__v')

        res.json({
            success: true,
            data: vouchers,
        })
    } catch (error) {
        console.error('Get public vouchers error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// @desc    Get single voucher
// @route   GET /api/vouchers/:id
// @access  Private
const getVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id).populate('restaurant', 'name')
        
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' })
        }

        res.json({
            success: true,
            data: voucher,
        })
    } catch (error) {
        console.error('Get voucher error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// @desc    Create voucher
// @route   POST /api/vouchers
// @access  Private (Restaurant Owner)
const createVoucher = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        if (!restaurant) {
            return res.status(404).json({ message: 'Không tìm thấy nhà hàng' })
        }

        const {
            code,
            name,
            description,
            discountType,
            discountValue,
            maxDiscount,
            minOrder,
            maxUsage,
            validFrom,
            validUntil,
            userRestriction,
        } = req.body

        // Validate
        if (!code || !name || !discountType || !discountValue || !validFrom || !validUntil) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
        }

        // Check if code exists
        const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() })
        if (existingVoucher) {
            return res.status(400).json({ message: 'Mã voucher đã tồn tại' })
        }

        const voucher = await Voucher.create({
            code: code.toUpperCase(),
            name,
            description,
            restaurant: restaurant._id,
            discountType,
            discountValue,
            maxDiscount: discountType === 'percentage' ? maxDiscount : null,
            minOrder: minOrder || 0,
            maxUsage: maxUsage || null,
            validFrom,
            validUntil,
            userRestriction: userRestriction || 'all',
        })

        res.status(201).json({
            success: true,
            data: voucher,
            message: 'Tạo voucher thành công',
        })
    } catch (error) {
        console.error('Create voucher error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// @desc    Update voucher
// @route   PUT /api/vouchers/:id
// @access  Private (Restaurant Owner)
const updateVoucher = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        if (!restaurant) {
            return res.status(404).json({ message: 'Không tìm thấy nhà hàng' })
        }

        const voucher = await Voucher.findById(req.params.id)
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' })
        }

        if (voucher.restaurant.toString() !== restaurant._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền cập nhật voucher này' })
        }

        const {
            name,
            description,
            discountType,
            discountValue,
            maxDiscount,
            minOrder,
            maxUsage,
            validFrom,
            validUntil,
            isActive,
            userRestriction,
        } = req.body

        voucher.name = name || voucher.name
        voucher.description = description !== undefined ? description : voucher.description
        voucher.discountType = discountType || voucher.discountType
        voucher.discountValue = discountValue || voucher.discountValue
        voucher.maxDiscount = discountType === 'percentage' ? maxDiscount : null
        voucher.minOrder = minOrder !== undefined ? minOrder : voucher.minOrder
        voucher.maxUsage = maxUsage !== undefined ? maxUsage : voucher.maxUsage
        voucher.validFrom = validFrom || voucher.validFrom
        voucher.validUntil = validUntil || voucher.validUntil
        voucher.isActive = isActive !== undefined ? isActive : voucher.isActive
        voucher.userRestriction = userRestriction || voucher.userRestriction

        await voucher.save()

        res.json({
            success: true,
            data: voucher,
            message: 'Cập nhật voucher thành công',
        })
    } catch (error) {
        console.error('Update voucher error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// @desc    Delete voucher
// @route   DELETE /api/vouchers/:id
// @access  Private (Restaurant Owner)
const deleteVoucher = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        if (!restaurant) {
            return res.status(404).json({ message: 'Không tìm thấy nhà hàng' })
        }

        const voucher = await Voucher.findById(req.params.id)
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' })
        }

        if (voucher.restaurant.toString() !== restaurant._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền xóa voucher này' })
        }

        await voucher.deleteOne()

        res.json({
            success: true,
            message: 'Xóa voucher thành công',
        })
    } catch (error) {
        console.error('Delete voucher error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// @desc    Validate voucher for user
// @route   POST /api/vouchers/validate
// @access  Private (Customer)
const validateVoucher = async (req, res) => {
    try {
        const { code, restaurantId, orderTotal } = req.body

        if (!code || !restaurantId || !orderTotal) {
            return res.status(400).json({ message: 'Thiếu thông tin' })
        }

        const voucher = await Voucher.findOne({
            code: code.toUpperCase(),
            restaurant: restaurantId,
        })

        if (!voucher) {
            return res.status(404).json({ message: 'Mã voucher không tồn tại' })
        }

        if (!voucher.isValid()) {
            return res.status(400).json({ message: 'Voucher không hợp lệ hoặc đã hết hạn' })
        }

        // Check if user already used this voucher
        const existingUsage = await VoucherUsage.findOne({
            voucher: voucher._id,
            user: req.user._id,
        })

        if (existingUsage) {
            return res.status(400).json({ message: 'Bạn đã sử dụng voucher này rồi' })
        }

        // Enforce userRestriction: 'new' = only users with no completed/paid orders
        // 'existing' = only users with at least one completed/paid order
        if (voucher.userRestriction && voucher.userRestriction !== 'all') {
            // Consider an order as completed if status === 'delivered' or paymentStatus === 'paid'
            const completedOrder = await require('../Models/Order').findOne({
                user: req.user._id,
                $or: [
                    { status: 'delivered' },
                    { paymentStatus: 'paid' },
                ],
            })

            if (voucher.userRestriction === 'new' && completedOrder) {
                return res.status(400).json({ message: 'Chỉ áp dụng cho khách hàng mới' })
            }

            if (voucher.userRestriction === 'existing' && !completedOrder) {
                return res.status(400).json({ message: 'Chỉ áp dụng cho khách hàng đã mua trước đó' })
            }
        }

        // Check min order
        if (orderTotal < voucher.minOrder) {
            return res.status(400).json({
                message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ`,
            })
        }

        // Calculate discount
        const discountAmount = voucher.calculateDiscount(orderTotal)

        res.json({
            success: true,
            data: {
                voucher: {
                    _id: voucher._id,
                    code: voucher.code,
                    name: voucher.name,
                    discountType: voucher.discountType,
                    discountValue: voucher.discountValue,
                },
                discountAmount,
                finalAmount: orderTotal - discountAmount,
            },
            message: 'Voucher hợp lệ',
        })
    } catch (error) {
        console.error('Validate voucher error:', error)
        res.status(500).json({ message: error.message || 'Lỗi server' })
    }
}

// @desc    Get voucher usage statistics
// @route   GET /api/vouchers/:id/stats
// @access  Private (Restaurant Owner)
const getVoucherStats = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        if (!restaurant) {
            return res.status(404).json({ message: 'Không tìm thấy nhà hàng' })
        }

        const voucher = await Voucher.findById(req.params.id)
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' })
        }

        if (voucher.restaurant.toString() !== restaurant._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền xem thống kê voucher này' })
        }

        const usages = await VoucherUsage.find({ voucher: voucher._id })
            .populate('user', 'name email')
            .populate('order', 'orderNumber totalAmount createdAt')
            .sort({ usedAt: -1 })

        const totalDiscount = usages.reduce((sum, usage) => sum + usage.discountAmount, 0)

        res.json({
            success: true,
            data: {
                voucher,
                usageCount: usages.length,
                totalDiscount,
                usages,
            },
        })
    } catch (error) {
        console.error('Get voucher stats error:', error)
        res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

module.exports = {
    getVouchers,
    getPublicVouchers,
    getVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
    getVoucherStats,
}
