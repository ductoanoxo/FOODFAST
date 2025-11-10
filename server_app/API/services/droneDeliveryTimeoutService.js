/**
 * DRONE DELIVERY TIMEOUT SERVICE
 * Xử lý logic khi drone đến nơi nhưng không gặp khách hàng
 * 
 * Flow:
 * 1. Drone đến nơi → Status: arrived_at_location
 * 2. Bắt đầu đợi → Status: waiting_for_customer (Timer: 5 phút)
 * 3. Khách nhận hàng → Status: delivered ✅
 * 4. Timeout → Status: delivery_failed → returning_to_restaurant → returned ❌
 */

const Order = require('../Models/Order');
const Drone = require('../Models/Drone');
const { sendPushNotification, sendSMS } = require('./notificationService');

// Thời gian đợi khách (milliseconds) - DEMO MODE: 40 giây
const WAITING_TIMEOUT = 40 * 1000; // 40 giây
// const WAITING_TIMEOUT = 5 * 60 * 1000; // 5 phút (production)

// Lưu trữ timers đang chạy
const activeTimers = new Map();

/**
 * Drone đã đến địa điểm giao hàng
 * Bắt đầu chờ khách và set timeout
 */
const handleDroneArrived = async(orderId, droneId, location) => {
    try {
        const order = await Order.findById(orderId)
            .populate('user', 'name phone fcmToken')
            .populate('restaurant', 'name phone');

        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật order status
        order.status = 'arrived_at_location';
        order.arrivedAt = new Date();
        await order.save();

        // Gửi thông báo cho khách
        await notifyCustomer(order, 'arrived');

        // Chờ 2 giây rồi chuyển sang waiting_for_customer
        setTimeout(async() => {
            await startWaitingForCustomer(orderId, droneId);
        }, 2000);

        return {
            success: true,
            message: 'Drone arrived at location',
            order: order
        };
    } catch (error) {
        console.error('Error in handleDroneArrived:', error);
        throw error;
    }
};

/**
 * Bắt đầu đợi khách nhận hàng
 * Set timeout 5 phút
 */
const startWaitingForCustomer = async(orderId, droneId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('user', 'name phone fcmToken');

        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật status sang waiting
        order.status = 'waiting_for_customer';
        order.waitingStartedAt = new Date();
        order.deliveryAttempts = (order.deliveryAttempts || 0) + 1;
        await order.save();

        // Gửi thông báo nhắc khách
        await notifyCustomer(order, 'waiting');

        // Set timeout 5 phút
        const timeoutId = setTimeout(async() => {
            console.log(`⏰ Timeout for order ${orderId} - Customer not present`);
            await handleDeliveryTimeout(orderId, droneId);
        }, WAITING_TIMEOUT);

        // Lưu timeout vào Map để có thể cancel nếu khách nhận hàng
        activeTimers.set(orderId.toString(), timeoutId);

        console.log(`⏳ Started waiting for customer - Order ${orderId} - ${WAITING_TIMEOUT / 1000}s timeout`);

        return {
            success: true,
            message: 'Waiting for customer started',
            timeoutSeconds: WAITING_TIMEOUT / 1000
        };
    } catch (error) {
        console.error('Error in startWaitingForCustomer:', error);
        throw error;
    }
};

/**
 * Khách hàng nhận hàng thành công
 * Cancel timeout và cập nhật status
 */
const confirmDeliveryReceived = async(orderId, confirmationCode) => {
    try {
        const order = await Order.findById(orderId)
            .populate('drone');

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra status
        if (order.status !== 'waiting_for_customer') {
            throw new Error(`Cannot confirm delivery. Current status: ${order.status}`);
        }

        // Cancel timeout
        const timeoutId = activeTimers.get(orderId.toString());
        if (timeoutId) {
            clearTimeout(timeoutId);
            activeTimers.delete(orderId.toString());
            console.log(`✅ Timeout cancelled for order ${orderId}`);
        }

        // Cập nhật order
        order.status = 'delivered';
        order.waitingEndedAt = new Date();
        order.deliveredAt = new Date();
        await order.save();

        // Cập nhật drone
        if (order.drone) {
            const drone = await Drone.findById(order.drone);
            if (drone) {
                drone.status = 'returning'; // Drone quay về base
                drone.currentOrder = null;
                drone.totalDeliveries = (drone.totalDeliveries || 0) + 1;
                await drone.save();
            }
        }

        // Gửi thông báo thành công
        await notifyCustomer(order, 'delivered');

        console.log(`📦 Order ${orderId} delivered successfully`);

        return {
            success: true,
            message: 'Delivery confirmed successfully',
            order: order
        };
    } catch (error) {
        console.error('Error in confirmDeliveryReceived:', error);
        throw error;
    }
};

/**
 * Timeout - Không gặp khách
 * Drone quay lại nhà hàng
 */
const handleDeliveryTimeout = async(orderId, droneId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('user', 'name phone fcmToken')
            .populate('restaurant', 'name phone');

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra nếu đã delivered (khách nhận lúc timeout vừa chạy)
        if (order.status === 'delivered') {
            console.log(`Order ${orderId} already delivered, skipping timeout`);
            return;
        }

        // Cập nhật order status
        order.status = 'delivery_failed';
        order.waitingEndedAt = new Date();
        order.deliveryFailedAt = new Date();
        order.cancelReason = 'Customer not present at delivery location';
        await order.save();

        // Gửi thông báo cho khách
        await notifyCustomer(order, 'failed');

        // Drone quay lại nhà hàng
        await startReturningToRestaurant(orderId, droneId);

        console.log(`❌ Delivery failed for order ${orderId} - Customer not present`);

        return {
            success: false,
            message: 'Delivery failed - Customer not present',
            order: order
        };
    } catch (error) {
        console.error('Error in handleDeliveryTimeout:', error);
        throw error;
    }
};

/**
 * Drone quay lại nhà hàng
 */
const startReturningToRestaurant = async(orderId, droneId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('restaurant', 'location');

        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật order
        order.status = 'returning_to_restaurant';
        order.returningAt = new Date();
        await order.save();

        // Cập nhật drone
        const drone = await Drone.findById(droneId);
        if (drone) {
            drone.status = 'returning';
            drone.destination = order.restaurant.location; // Set destination về nhà hàng
            await drone.save();
        }

        // Simulate return trip (giả lập bay về)
        // Thời gian bay về = thời gian bay đi
        const returnTime = order.estimatedDuration || 10; // minutes

        setTimeout(async() => {
            await handleDroneReturned(orderId, droneId);
        }, returnTime * 60 * 1000); // Convert to milliseconds

        console.log(`🔙 Drone returning to restaurant - Order ${orderId} - ETA ${returnTime} minutes`);

        return {
            success: true,
            message: 'Drone returning to restaurant',
            estimatedReturnTime: returnTime
        };
    } catch (error) {
        console.error('Error in startReturningToRestaurant:', error);
        throw error;
    }
};

/**
 * Drone đã quay lại nhà hàng
 */
const handleDroneReturned = async(orderId, droneId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Cập nhật order
        order.status = 'returned';
        order.returnedAt = new Date();
        await order.save();

        // Cập nhật drone
        const drone = await Drone.findById(droneId);
        if (drone) {
            drone.status = 'idle';
            drone.currentOrder = null;
            drone.currentLocation = order.restaurant.location; // Đã về nhà hàng
            await drone.save();
        }

        // TODO: Xử lý hoàn tiền cho khách (nếu đã thanh toán)
        if (order.paymentStatus === 'paid') {
            // Trigger refund process
            console.log(`💰 Refund needed for order ${orderId}`);
        }

        console.log(`🏠 Drone returned to restaurant - Order ${orderId}`);

        return {
            success: true,
            message: 'Drone returned to restaurant',
            order: order
        };
    } catch (error) {
        console.error('Error in handleDroneReturned:', error);
        throw error;
    }
};

/**
 * Gửi thông báo cho khách hàng
 */
const notifyCustomer = async(order, type) => {
    try {
        const user = order.user;
        if (!user) return;

        let title, message;

        switch (type) {
            case 'arrived':
                title = '🚁 Drone đã đến!';
                message = `Đơn hàng #${order.orderNumber} đã đến địa điểm giao hàng. Vui lòng ra nhận hàng.`;
                break;

            case 'waiting':
                title = '⏳ Đang chờ bạn nhận hàng';
                message = `Drone sẽ đợi 5 phút. Vui lòng ra nhận hàng ngay để tránh bị hủy.`;
                break;

            case 'delivered':
                title = '✅ Giao hàng thành công!';
                message = `Cảm ơn bạn đã sử dụng dịch vụ. Đánh giá đơn hàng #${order.orderNumber} nhé!`;
                break;

            case 'failed':
                title = '❌ Giao hàng thất bại';
                message = `Không gặp bạn tại địa điểm giao hàng. Đơn #${order.orderNumber} sẽ được hoàn trả. Vui lòng liên hệ hotline.`;
                break;
        }

        // Send push notification
        if (user.fcmToken) {
            await sendPushNotification(user.fcmToken, title, message);
        }

        // Send SMS (critical notifications)
        if ((type === 'arrived' || type === 'failed') && user.phone) {
            await sendSMS(user.phone, message);
        }

        console.log(`📧 Notification sent to customer - Type: ${type}, Order: ${order.orderNumber}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

/**
 * Get timeout status của order
 */
const getWaitingStatus = (orderId) => {
    const timeoutId = activeTimers.get(orderId.toString());
    return {
        isWaiting: !!timeoutId,
        timeoutId: timeoutId || null
    };
};

/**
 * Cancel timeout manually (admin/emergency)
 */
const cancelWaitingTimeout = (orderId) => {
    const timeoutId = activeTimers.get(orderId.toString());
    if (timeoutId) {
        clearTimeout(timeoutId);
        activeTimers.delete(orderId.toString());
        console.log(`🛑 Timeout manually cancelled for order ${orderId}`);
        return true;
    }
    return false;
};

module.exports = {
    handleDroneArrived,
    startWaitingForCustomer,
    confirmDeliveryReceived,
    handleDeliveryTimeout,
    startReturningToRestaurant,
    handleDroneReturned,
    getWaitingStatus,
    cancelWaitingTimeout,
    WAITING_TIMEOUT
};