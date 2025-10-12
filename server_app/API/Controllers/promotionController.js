const Promotion = require('../Models/Promotion')
const Product = require('../Models/Product')
const Restaurant = require('../Models/Restaurant')

// Get all promotions for a restaurant
exports.getPromotions = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        
        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            })
        }

        const promotions = await Promotion.find({ restaurant: restaurant._id })
            .populate('category', 'name')
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            data: promotions,
        })
    } catch (error) {
        console.error('Get promotions error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// Get active promotions by restaurant ID (public)
exports.getActivePromotions = async (req, res) => {
    try {
        const { restaurantId } = req.params
        const now = new Date()

        const promotions = await Promotion.find({
            restaurant: restaurantId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).populate('category', 'name')

        res.json({
            success: true,
            data: promotions,
        })
    } catch (error) {
        console.error('Get active promotions error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// Create promotion
exports.createPromotion = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        
        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            })
        }

        const { name, description, discountPercent, category, startDate, endDate } = req.body

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date',
            })
        }

        const promotion = await Promotion.create({
            restaurant: restaurant._id,
            name,
            description,
            discountPercent,
            category,
            startDate,
            endDate,
        })

        await promotion.populate('category', 'name')

        res.status(201).json({
            success: true,
            message: 'Promotion created successfully',
            data: promotion,
        })
    } catch (error) {
        console.error('Create promotion error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// Update promotion
exports.updatePromotion = async (req, res) => {
    try {
        const { id } = req.params
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        
        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            })
        }

        const promotion = await Promotion.findOne({ 
            _id: id, 
            restaurant: restaurant._id 
        })

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found',
            })
        }

        const { name, description, discountPercent, category, startDate, endDate, isActive } = req.body

        // Validate dates if provided
        const newStartDate = startDate ? new Date(startDate) : promotion.startDate
        const newEndDate = endDate ? new Date(endDate) : promotion.endDate
        
        if (newStartDate >= newEndDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date',
            })
        }

        Object.assign(promotion, {
            name: name || promotion.name,
            description: description !== undefined ? description : promotion.description,
            discountPercent: discountPercent || promotion.discountPercent,
            category: category || promotion.category,
            startDate: newStartDate,
            endDate: newEndDate,
            isActive: isActive !== undefined ? isActive : promotion.isActive,
        })

        await promotion.save()
        await promotion.populate('category', 'name')

        res.json({
            success: true,
            message: 'Promotion updated successfully',
            data: promotion,
        })
    } catch (error) {
        console.error('Update promotion error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// Delete promotion
exports.deletePromotion = async (req, res) => {
    try {
        const { id } = req.params
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        
        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            })
        }

        const promotion = await Promotion.findOneAndDelete({ 
            _id: id, 
            restaurant: restaurant._id 
        })

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found',
            })
        }

        res.json({
            success: true,
            message: 'Promotion deleted successfully',
        })
    } catch (error) {
        console.error('Delete promotion error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// Toggle promotion status
exports.togglePromotionStatus = async (req, res) => {
    try {
        const { id } = req.params
        const restaurant = await Restaurant.findOne({ owner: req.user._id })
        
        if (!restaurant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Restaurant not found' 
            })
        }

        const promotion = await Promotion.findOne({ 
            _id: id, 
            restaurant: restaurant._id 
        })

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found',
            })
        }

        promotion.isActive = !promotion.isActive
        await promotion.save()
        await promotion.populate('category', 'name')

        res.json({
            success: true,
            message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'} successfully`,
            data: promotion,
        })
    } catch (error) {
        console.error('Toggle promotion error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// Get products with applied promotions
exports.getProductsWithPromotions = async (req, res) => {
    try {
        const { restaurantId } = req.params
        const now = new Date()

        // Get active promotions
        const promotions = await Promotion.find({
            restaurant: restaurantId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        })

        // Get all products from this restaurant
        const products = await Product.find({ restaurant: restaurantId })
            .populate('category', 'name')

        // Apply promotions to products
        const productsWithPromotions = products.map(product => {
            const productObj = product.toObject()
            const promo = promotions.find(p => 
                p.category.toString() === product.category._id.toString()
            )

            if (promo) {
                const originalPrice = productObj.price
                const discountAmount = (originalPrice * promo.discountPercent) / 100
                const finalPrice = originalPrice - discountAmount

                productObj.promotion = {
                    id: promo._id,
                    name: promo.name,
                    discountPercent: promo.discountPercent,
                    originalPrice: originalPrice,
                    finalPrice: Math.round(finalPrice),
                }
                productObj.price = Math.round(finalPrice)
            }

            return productObj
        })

        res.json({
            success: true,
            data: productsWithPromotions,
        })
    } catch (error) {
        console.error('Get products with promotions error:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        })
    }
}
