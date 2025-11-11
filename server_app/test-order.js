const mongoose = require('mongoose');
const Order = require('./API/Models/Order');
const Drone = require('./API/Models/Drone');
const Restaurant = require('./API/Models/Restaurant');

// Connect to MongoDB
mongoose.connect('mongodb+srv://toantra349:toantoan123@ktpm.dwb8wtz.mongodb.net/FOODFASTDRONEDELIVERY?retryWrites=true&w=majority&appName=KTPM', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ MongoDB Connected');
    return testOrder();
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

async function testOrder() {
    try {
        // Find specific order
        const order = await Order.findOne({ orderNumber: 'ORD176019678130232' })
            .populate('drone', 'name serialNumber status currentOrder')
            .populate('restaurant', 'name');

        if (!order) {
            console.log('❌ Order ORD176019678130232 not found');
        } else {
            console.log('\n📦 Order ORD176019678130232 Details:');
            console.log('Order ID:', order._id);
            console.log('Order Number:', order.orderNumber);
            console.log('Status:', order.status);
            console.log('Drone:', order.drone ? `${order.drone.name} (status: ${order.drone.status}, currentOrder: ${order.drone.currentOrder})` : 'NULL');
            console.log('Restaurant:', order.restaurant ? order.restaurant.name : 'NULL');
            console.log('Created At:', order.createdAt);
            console.log('Ready At:', order.readyAt);
            console.log('Delivering At:', order.deliveringAt);
            console.log('Delivered At:', order.deliveredAt);

            // Check drone details
            if (order.drone && order.drone._id) {
                const drone = await Drone.findById(order.drone._id);
                console.log('\n🚁 Drone Full Details:');
                console.log('Drone ID:', drone._id);
                console.log('Name:', drone.name);
                console.log('Status:', drone.status);
                console.log('Current Order:', drone.currentOrder);
                console.log('Battery:', drone.batteryLevel);
                console.log('Total Flights:', drone.totalFlights);
            }
        }

        // Check all orders with status 'ready' and no drone
        const readyOrders = await Order.find({
            status: 'ready',
            drone: null,
        }).populate('restaurant', 'name');

        console.log(`\n📋 Total ready orders without drone: ${readyOrders.length}`);
        readyOrders.forEach(o => {
            console.log(`  - ${o.orderNumber}: ${o.restaurant?.name || 'Unknown'} (${o.status})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
        process.exit(0);
    }
}