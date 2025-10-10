const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./API/Models/User');
const Restaurant = require('./API/Models/Restaurant');
const Product = require('./API/Models/Product');
const Category = require('./API/Models/Category');
const Drone = require('./API/Models/Drone');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async() => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Drone.deleteMany({});

        console.log('Cleared existing data...');

        // Create Users
        const users = await User.create([{
                name: 'Admin User',
                email: 'admin@foodfast.com',
                password: 'admin123',
                role: 'admin',
                phone: '0901234567',
                address: '123 Admin St, HCM City',
            },
            {
                name: 'John Doe',
                email: 'user@foodfast.com',
                password: 'user123',
                role: 'user',
                phone: '0901234568',
                address: '456 User St, HCM City',
                location: {
                    type: 'Point',
                    coordinates: [106.6297, 10.8231],
                },
            },
            {
                name: 'Restaurant Owner',
                email: 'restaurant@foodfast.com',
                password: 'restaurant123',
                role: 'restaurant',
                phone: '0901234569',
                address: '789 Restaurant Ave, HCM City',
            },
            {
                name: 'Drone Operator',
                email: 'drone@foodfast.com',
                password: 'drone123',
                role: 'drone',
                phone: '0901234570',
                address: '101 Drone Rd, HCM City',
            },
        ]);

        console.log('Users created:', users.length);

        // Create Categories
        const categories = await Category.create([
            { name: 'Cơm', description: 'Các món cơm', image: 'https://via.placeholder.com/150' },
            { name: 'Phở', description: 'Các món phở', image: 'https://via.placeholder.com/150' },
            { name: 'Bún', description: 'Các món bún', image: 'https://via.placeholder.com/150' },
            { name: 'Đồ uống', description: 'Nước giải khát', image: 'https://via.placeholder.com/150' },
            { name: 'Fastfood', description: 'Đồ ăn nhanh', image: 'https://via.placeholder.com/150' },
        ]);

        console.log('Categories created:', categories.length);

        // Create Restaurants
        const restaurants = await Restaurant.create([{
                name: 'Cơm Tấm Sài Gòn',
                description: 'Cơm tấm ngon nhất Sài Gòn',
                image: 'https://via.placeholder.com/300',
                rating: 4.5,
                totalReviews: 125,
                address: '123 Nguyen Hue, District 1, HCM City',
                phone: '0281234567',
                email: 'comtam@restaurant.com',
                location: {
                    type: 'Point',
                    coordinates: [106.7006, 10.7756],
                },
                openingHours: '07:00 - 22:00',
                owner: users[2]._id,
            },
            {
                name: 'Phở Hà Nội',
                description: 'Phở bò Hà Nội chính gốc',
                image: 'https://via.placeholder.com/300',
                rating: 4.7,
                totalReviews: 89,
                address: '456 Le Loi, District 1, HCM City',
                phone: '0281234568',
                email: 'pho@restaurant.com',
                location: {
                    type: 'Point',
                    coordinates: [106.6947, 10.7731],
                },
                openingHours: '06:00 - 21:00',
                owner: users[2]._id,
            },
            {
                name: 'KFC HCM',
                description: 'Gà rán KFC',
                image: 'https://via.placeholder.com/300',
                rating: 4.3,
                totalReviews: 234,
                address: '789 Tran Hung Dao, District 5, HCM City',
                phone: '0281234569',
                email: 'kfc@restaurant.com',
                location: {
                    type: 'Point',
                    coordinates: [106.6811, 10.7543],
                },
                openingHours: '08:00 - 23:00',
                owner: users[2]._id,
            },
        ]);

        console.log('Restaurants created:', restaurants.length);

        // Create Products
        const products = await Product.create([{
                name: 'Cơm Tấm Sườn Bì Chả',
                description: 'Cơm tấm với sườn nướng, bì và chả trứng',
                price: 45000,
                image: 'https://via.placeholder.com/300',
                category: categories[0]._id,
                restaurant: restaurants[0]._id,
                stock: 100,
                rating: 4.6,
                totalReviews: 45,
            },
            {
                name: 'Cơm Tấm Sườn Nướng',
                description: 'Cơm tấm với sườn nướng thơm lừng',
                price: 35000,
                image: 'https://via.placeholder.com/300',
                category: categories[0]._id,
                restaurant: restaurants[0]._id,
                stock: 100,
                rating: 4.5,
                totalReviews: 32,
            },
            {
                name: 'Phở Bò Tái',
                description: 'Phở bò với thịt tái mềm',
                price: 50000,
                image: 'https://via.placeholder.com/300',
                category: categories[1]._id,
                restaurant: restaurants[1]._id,
                stock: 80,
                rating: 4.8,
                totalReviews: 67,
            },
            {
                name: 'Phở Bò Chín',
                description: 'Phở bò với thịt chín',
                price: 55000,
                image: 'https://via.placeholder.com/300',
                category: categories[1]._id,
                restaurant: restaurants[1]._id,
                stock: 80,
                rating: 4.7,
                totalReviews: 54,
            },
            {
                name: 'Gà Rán 2 Miếng',
                description: '2 miếng gà rán giòn tan',
                price: 65000,
                image: 'https://via.placeholder.com/300',
                category: categories[4]._id,
                restaurant: restaurants[2]._id,
                stock: 150,
                rating: 4.4,
                totalReviews: 89,
            },
            {
                name: 'Combo Gà + Burger',
                description: 'Combo gà rán, burger và coca',
                price: 95000,
                image: 'https://via.placeholder.com/300',
                category: categories[4]._id,
                restaurant: restaurants[2]._id,
                stock: 120,
                rating: 4.5,
                totalReviews: 123,
            },
            {
                name: 'Trà Đá',
                description: 'Trà đá mát lạnh',
                price: 5000,
                image: 'https://via.placeholder.com/300',
                category: categories[3]._id,
                restaurant: restaurants[0]._id,
                stock: 200,
                rating: 4.0,
                totalReviews: 12,
            },
        ]);

        console.log('Products created:', products.length);

        // Create Drones
        const drones = await Drone.create([{
                name: 'Drone Alpha',
                serialNumber: 'DRONE-001',
                model: 'DJI Mavic 3',
                status: 'available',
                batteryLevel: 100,
                maxWeight: 5,
                currentLocation: {
                    type: 'Point',
                    coordinates: [106.6947, 10.7731],
                },
                homeLocation: {
                    type: 'Point',
                    coordinates: [106.6947, 10.7731],
                },
            },
            {
                name: 'Drone Beta',
                serialNumber: 'DRONE-002',
                model: 'DJI Mini 3 Pro',
                status: 'available',
                batteryLevel: 85,
                maxWeight: 3,
                currentLocation: {
                    type: 'Point',
                    coordinates: [106.7006, 10.7756],
                },
                homeLocation: {
                    type: 'Point',
                    coordinates: [106.7006, 10.7756],
                },
            },
            {
                name: 'Drone Gamma',
                serialNumber: 'DRONE-003',
                model: 'DJI Air 2S',
                status: 'charging',
                batteryLevel: 25,
                maxWeight: 4,
                currentLocation: {
                    type: 'Point',
                    coordinates: [106.6811, 10.7543],
                },
                homeLocation: {
                    type: 'Point',
                    coordinates: [106.6811, 10.7543],
                },
            },
        ]);

        console.log('Drones created:', drones.length);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: admin@foodfast.com / admin123');
        console.log('User: user@foodfast.com / user123');
        console.log('Restaurant: restaurant@foodfast.com / restaurant123');
        console.log('Drone: drone@foodfast.com / drone123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();