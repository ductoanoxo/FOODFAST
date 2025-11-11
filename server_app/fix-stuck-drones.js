const mongoose = require('mongoose');
const Order = require('./API/Models/Order');
const Drone = require('./API/Models/Drone');

// Connect to MongoDB
mongoose.connect('mongodb+srv://toantra349:toantoan123@ktpm.dwb8wtz.mongodb.net/FOODFASTDRONEDELIVERY?retryWrites=true&w=majority&appName=KTPM', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ MongoDB Connected');
    return fixStuckDrones();
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

async function fixStuckDrones() {
    try {
        console.log('\n🔧 Finding and fixing stuck drones and orders...\n');

        // STEP 1: Fix orders with status 'confirmed' that have drones assigned
        console.log('📦 STEP 1: Fixing orders with status "confirmed" but have drones assigned...\n');
        const confirmedOrders = await Order.find({
            status: 'confirmed',
            drone: { $ne: null }
        }).populate('drone', 'name');

        console.log(`Found ${confirmedOrders.length} confirmed orders with drones assigned`);

        for (const order of confirmedOrders) {
            console.log(`  Order ${order.orderNumber}: Fixing status confirmed → delivering`);
            order.status = 'delivering';
            if (!order.deliveringAt) {
                order.deliveringAt = new Date();
            }
            await order.save();
            console.log(`    ✅ Fixed`);
        }

        // STEP 2: Find all drones with status 'busy'
        console.log('\n🚁 STEP 2: Checking busy drones...\n');
        const busyDrones = await Drone.find({ status: 'busy' });
        console.log(`Found ${busyDrones.length} drones with status 'busy'`);

        let fixedCount = 0;

        for (const drone of busyDrones) {
            console.log(`\n🚁 Checking drone: ${drone.name} (${drone._id})`);

            if (!drone.currentOrder) {
                console.log(`  ⚠️ Drone has no currentOrder but status is 'busy' - FIXING...`);
                drone.status = 'available';
                await drone.save();
                fixedCount++;
                console.log(`  ✅ Fixed: Set status to 'available'`);
                continue;
            }

            // Check if the order still exists and its status
            const order = await Order.findById(drone.currentOrder);

            if (!order) {
                console.log(`  ⚠️ Order ${drone.currentOrder} not found - FIXING...`);
                drone.status = 'available';
                drone.currentOrder = null;
                await drone.save();
                fixedCount++;
                console.log(`  ✅ Fixed: Order not found, set drone to available`);
                continue;
            }

            console.log(`  📦 Order: ${order.orderNumber} (status: ${order.status})`);

            // If order is delivered, drone should be available
            if (order.status === 'delivered') {
                console.log(`  ⚠️ Order is delivered but drone is still busy - FIXING...`);
                drone.status = 'available';
                drone.currentOrder = null;
                drone.totalFlights = (drone.totalFlights || 0) + 1;
                await drone.save();
                fixedCount++;
                console.log(`  ✅ Fixed: Set drone to available, cleared currentOrder`);
                continue;
            }

            // If order is cancelled, drone should be available
            if (order.status === 'cancelled') {
                console.log(`  ⚠️ Order is cancelled but drone is still busy - FIXING...`);
                drone.status = 'available';
                drone.currentOrder = null;
                await drone.save();
                fixedCount++;
                console.log(`  ✅ Fixed: Set drone to available, cleared currentOrder`);
                continue;
            }

            console.log(`  ✅ OK: Drone correctly assigned to active order`);
        }

        console.log(`\n\n📊 Summary:`);
        console.log(`  Fixed confirmed orders: ${confirmedOrders.length}`);
        console.log(`  Total busy drones: ${busyDrones.length}`);
        console.log(`  Fixed drones: ${fixedCount}`);
        console.log(`  Still busy (correct): ${busyDrones.length - fixedCount}`);

        // Show current drone status
        const availableDrones = await Drone.countDocuments({ status: 'available' });
        const busyDronesAfter = await Drone.countDocuments({ status: 'busy' });
        const offlineDrones = await Drone.countDocuments({ status: 'offline' });

        console.log(`\n📊 Current Drone Status:`);
        console.log(`  Available: ${availableDrones}`);
        console.log(`  Busy: ${busyDronesAfter}`);
        console.log(`  Offline: ${offlineDrones}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
        process.exit(0);
    }
}