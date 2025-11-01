// Quick test script for drone delivery simulation
// Run with: node test-drone-simulation.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test coordinates (Ho Chi Minh City)
const LANDMARK_81 = {
    type: 'Point',
    coordinates: [106.7203, 10.7942] // [lng, lat]
};

const BITEXCO_TOWER = {
    type: 'Point',
    coordinates: [106.7034, 10.7718] // [lng, lat]
};

async function testDroneSimulation() {
    try {
        console.log('🚀 Starting Drone Delivery Simulation Test\n');

        // Step 1: Login as admin
        console.log('1️⃣  Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@foodfast.com',
            password: 'admin123',
        });
        const adminToken = loginRes.data.token;
        console.log('✅ Logged in successfully\n');

        // Step 2: Create a test drone
        console.log('2️⃣  Creating test drone...');
        const droneRes = await axios.post(
            `${API_URL}/drones`, {
                name: 'Test Drone Alpha',
                model: 'DJI M300',
                serialNumber: `TEST-${Date.now()}`,
                status: 'available',
                batteryLevel: 100,
                homeLocation: LANDMARK_81,
                currentLocation: LANDMARK_81,
                maxRange: 10,
                speed: 60, // 60 km/h for faster testing
            }, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }
        );
        const droneId = droneRes.data.data._id;
        console.log(`✅ Drone created: ${droneId}\n`);

        // Step 3: Create a test order
        console.log('3️⃣  Creating test order...');

        // First, login as customer
        const customerRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'user@test.com',
            password: 'user123',
        });
        const customerToken = customerRes.data.token;

        // Get a restaurant
        const restaurantsRes = await axios.get(`${API_URL}/restaurants`);
        let restaurant = restaurantsRes.data.data[0];

        // Update restaurant location if needed
        if (!restaurant.location || !restaurant.location.coordinates) {
            await axios.put(
                `${API_URL}/restaurants/${restaurant._id}`, {
                    location: LANDMARK_81,
                }, {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );
            console.log('✅ Updated restaurant location\n');
        }

        // Get products from restaurant
        const productsRes = await axios.get(`${API_URL}/products?restaurant=${restaurant._id}`);
        const product = productsRes.data.data[0];

        if (!product) {
            console.log('❌ No products found. Please create products first.');
            return;
        }

        // Create order
        const orderRes = await axios.post(
            `${API_URL}/orders`, {
                items: [{
                    product: product._id,
                    quantity: 2,
                }, ],
                deliveryInfo: {
                    name: 'Test Customer',
                    phone: '0901234567',
                    address: 'Bitexco Tower, Q.1, HCMC',
                    location: BITEXCO_TOWER,
                },
                paymentMethod: 'COD',
            }, {
                headers: { Authorization: `Bearer ${customerToken}` },
            }
        );
        const orderId = orderRes.data.data._id;
        console.log(`✅ Order created: ${orderId}\n`);

        // Step 4: Update order status to ready
        console.log('4️⃣  Updating order status to ready...');
        await axios.patch(
            `${API_URL}/orders/${orderId}/status`, { status: 'confirmed' }, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }
        );
        await axios.patch(
            `${API_URL}/orders/${orderId}/status`, { status: 'preparing' }, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }
        );
        await axios.patch(
            `${API_URL}/orders/${orderId}/status`, { status: 'ready' }, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }
        );
        console.log('✅ Order status updated to ready\n');

        // Step 5: Assign drone to order
        console.log('5️⃣  Assigning drone to order...');
        await axios.post(
            `${API_URL}/drones/${droneId}/assign`, { orderId }, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }
        );
        console.log('✅ Drone assigned to order\n');

        // Step 6: Start delivery simulation
        console.log('6️⃣  Starting delivery simulation...');
        const simulationRes = await axios.post(
            `${API_URL}/drones/${droneId}/start-delivery`, { orderId }, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }
        );
        console.log('✅ Delivery simulation started!');
        console.log(`   Estimated time: ${simulationRes.data.data.estimatedTimeMinutes} minutes`);
        console.log(`   Total distance: ${simulationRes.data.data.totalDistance} km`);
        console.log(`   Update interval: ${simulationRes.data.data.updateInterval}ms`);
        console.log(`   Total steps: ${simulationRes.data.data.totalSteps}\n`);

        console.log('📍 Track the order at:');
        console.log(`   http://localhost:5173/order-tracking/${orderId}\n`);

        console.log('🎉 Test completed successfully!');
        console.log('   The drone is now simulating delivery.');
        console.log('   Open the tracking page to see it in action!\n');

        // Optionally, wait and check simulation status
        setTimeout(async() => {
            try {
                const simsRes = await axios.get(`${API_URL}/drones/simulations`, {
                    headers: { Authorization: `Bearer ${adminToken}` },
                });
                console.log('📊 Active simulations:', simsRes.data.count);
                console.log(JSON.stringify(simsRes.data.data, null, 2));
            } catch (error) {
                console.error('Error checking simulations:', error.message);
            }
        }, 5000);

    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error('   Message:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testDroneSimulation();