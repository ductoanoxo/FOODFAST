const mongoose = require('mongoose');
const Drone = require('./API/Models/Drone');

// Connect to MongoDB
mongoose.connect('mongodb+srv://toantra349:toantoan123@ktpm.dwb8wtz.mongodb.net/FOODFASTDRONEDELIVERY?retryWrites=true&w=majority&appName=KTPM', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ MongoDB Connected');
    return checkDroneStatus();
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    throw err;
});

async function checkDroneStatus() {
    try {
        console.log('\n🚁 Checking all drones status...\n');

        const drones = await Drone.find().populate('currentOrder', 'orderNumber status');

        console.log(`Total drones: ${drones.length}\n`);

        const statusCount = {
            available: 0,
            busy: 0,
            charging: 0,
            maintenance: 0,
            offline: 0,
        };

        drones.forEach(drone => {
                    statusCount[drone.status] = (statusCount[drone.status] || 0) + 1;

                    console.log(`📍 ${drone.name} (${drone._id})`);
                    console.log(`   Status: ${drone.status}`);
                    console.log(`   Battery: ${drone.batteryLevel}%`);
                    console.log(`   Total Flights: ${drone.totalFlights || 0}`);
                    console.log(`   Current Order: ${drone.currentOrder ? `${drone.currentOrder.orderNumber} (${drone.currentOrder.status})` : 'NULL'}`);
            console.log('');
        });
        
        console.log('📊 Status Summary:');
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
    }
}