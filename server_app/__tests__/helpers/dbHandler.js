/**
 * 🗄️ DATABASE HANDLER FOR TESTS
 * Setup và cleanup MongoDB cho integration tests
 */

const mongoose = require('mongoose');

class DbHandler {
    async connect() {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodfast_test';
        
        try {
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Test DB connected:', mongoUri);
        } catch (error) {
            console.error('❌ Test DB connection error:', error);
            throw error;
        }
    }

    async closeDatabase() {
        try {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            console.log('✅ Test DB closed and cleaned');
        } catch (error) {
            console.error('❌ Error closing test DB:', error);
            throw error;
        }
    }

    async clearDatabase() {
        try {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                await collections[key].deleteMany({});
            }
            console.log('🧹 Test DB cleared');
        } catch (error) {
            console.error('❌ Error clearing test DB:', error);
            throw error;
        }
    }
}

module.exports = new DbHandler();
