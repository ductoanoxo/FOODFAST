/**
 * TEST SCRIPT: Drone Delivery Timeout Simulation
 * 
 * Test flow giao hàng với timeout khi không gặp khách
 * 
 * Setup:
 * 1. Tạo order với status 'delivering'
 * 2. Giả lập drone đến nơi
 * 3. Chờ timeout hoặc confirm nhận hàng
 * 
 * Run: node test-drone-delivery-timeout.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./API/Models/Order');
const Drone = require('./API/Models/Drone');
const User = require('./API/Models/User');
const Restaurant = require('./API/Models/Restaurant');
const {
    handleDroneArrived,
    confirmDeliveryReceived,
    getWaitingStatus
} = require('./API/services/droneDeliveryTimeoutService');

// Test data IDs (replace with real IDs from your DB)
let testOrderId;
let testDroneId;

async function setup() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Tìm hoặc tạo test data
        const user = await User.findOne({ email: 'test@example.com' }) ||
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                phone: '0901234567',
                password: 'password123'
            });

        const restaurant = await Restaurant.findOne() ||
            await Restaurant.create({
                name: 'Test Restaurant',
                address: '123 Test St',
                phone: '0987654321',
                email: 'restaurant@test.com',
                owner: user._id,
                location: {
                    type: 'Point',
                    coordinates: [106.6297, 10.8231] // HCMC
                }
            });

        const drone = await Drone.findOne({ status: 'idle' }) ||
            await Drone.create({
                name: 'Test Drone 1',
                model: 'DJI Phantom',
                serialNumber: 'TD001',
                status: 'idle',
                batteryLevel: 80,
                currentLocation: {
                    type: 'Point',
                    coordinates: [106.6297, 10.8231]
                }
            });

        testDroneId = drone._id;

        // Tạo test order
        const order = await Order.create({
            orderNumber: `TEST-${Date.now()}`,
            user: user._id,
            restaurant: restaurant._id,
            items: [{
                product: new mongoose.Types.ObjectId(),
                quantity: 2,
                price: 50000,
                originalPrice: 50000
            }],
            deliveryInfo: {
                name: user.name,
                phone: user.phone,
                address: '456 Delivery St, HCMC',
                location: {
                    type: 'Point',
                    coordinates: [106.6500, 10.8500] // ~3km away
                }
            },
            subtotal: 100000,
            deliveryFee: 15000,
            totalAmount: 115000,
            status: 'delivering',
            drone: drone._id,
            deliveringAt: new Date()
        });

        testOrderId = order._id;

        console.log('📦 Test order created:');
        console.log(`   Order ID: ${testOrderId}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Drone: ${drone.name}\n`);

        return { order, drone };
    } catch (error) {
        console.error('❌ Setup error:', error);
        throw error;
    }
}

async function testScenario1_CustomerReceives() {
    console.log('\n🧪 === TEST SCENARIO 1: Customer Receives Delivery ===\n');

    try {
        // Step 1: Drone arrives
        console.log('Step 1: Drone arriving at location...');
        const arrivalResult = await handleDroneArrived(
            testOrderId,
            testDroneId, { coordinates: [106.6500, 10.8500] }
        );
        console.log(`✅ Status: ${arrivalResult.order.status}`);
        console.log(`   Arrived at: ${arrivalResult.order.arrivedAt}\n`);

        // Wait 2 seconds for auto transition to waiting_for_customer
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check status
        const order1 = await Order.findById(testOrderId);
        console.log(`Current status: ${order1.status}`);
        console.log(`Waiting started: ${order1.waitingStartedAt}\n`);

        // Step 2: Customer confirms (after 10 seconds)
        console.log('Step 2: Waiting 10 seconds before customer confirms...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        console.log('Customer confirming delivery...');
        const confirmResult = await confirmDeliveryReceived(testOrderId);
        console.log(`✅ Status: ${confirmResult.order.status}`);
        console.log(`   Delivered at: ${confirmResult.order.deliveredAt}`);

        const waitingDuration = (new Date(confirmResult.order.waitingEndedAt) -
            new Date(confirmResult.order.waitingStartedAt)) / 1000;
        console.log(`   Waiting duration: ${waitingDuration}s\n`);

        console.log('✅ TEST PASSED: Customer received delivery successfully!\n');
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    }
}

async function testScenario2_Timeout() {
    console.log('\n🧪 === TEST SCENARIO 2: Customer Not Present (Timeout) ===\n');

    try {
        // Reset order to delivering
        await Order.findByIdAndUpdate(testOrderId, {
            status: 'delivering',
            arrivedAt: null,
            waitingStartedAt: null,
            waitingEndedAt: null,
            deliveredAt: null,
            deliveryFailedAt: null
        });

        console.log('Step 1: Drone arriving at location...');
        await handleDroneArrived(
            testOrderId,
            testDroneId, { coordinates: [106.6500, 10.8500] }
        );

        // Wait for auto transition
        await new Promise(resolve => setTimeout(resolve, 3000));

        const order = await Order.findById(testOrderId);
        console.log(`✅ Status: ${order.status}`);
        console.log(`   Waiting started: ${order.waitingStartedAt}\n`);

        console.log('Step 2: Waiting for timeout (5 minutes)...');
        console.log('⏳ Timeout will trigger automatically...\n');
        console.log('(In production, timeout = 5 minutes)');
        console.log('(In this test, check Order model for timeout results)\n');

        // Check waiting status
        const waitingStatus = getWaitingStatus(testOrderId);
        console.log(`Timeout active: ${waitingStatus.isWaiting}`);

        // Wait 10 seconds to show it's waiting
        await new Promise(resolve => setTimeout(resolve, 10000));

        const order2 = await Order.findById(testOrderId);
        console.log(`\nCurrent status after 10s: ${order2.status}`);

        if (order2.status === 'delivery_failed') {
            console.log('✅ TEST PASSED: Timeout triggered, delivery failed!\n');
            console.log(`   Failed at: ${order2.deliveryFailedAt}`);
            console.log(`   Next status: ${order2.status === 'delivery_failed' ? 'returning_to_restaurant' : order2.status}`);
        } else {
            console.log('⏳ Still waiting... (check again after timeout)\n');
        }
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    }
}

async function runTests() {
    try {
        await setup();

        // Choose which scenario to test
        console.log('\n📋 Available test scenarios:');
        console.log('1. Customer receives delivery (confirm after 10s)');
        console.log('2. Customer not present (wait for timeout)\n');

        const scenario = process.argv[2] || '1';

        if (scenario === '1') {
            await testScenario1_CustomerReceives();
        } else if (scenario === '2') {
            await testScenario2_Timeout();
        } else {
            console.log('Usage: node test-drone-delivery-timeout.js [1|2]');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        console.log('\n🔌 Closing MongoDB connection...');
        await mongoose.connection.close();
        console.log('✅ Connection closed\n');
        process.exit(0);
    }
}

// Run tests
runTests();