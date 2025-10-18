const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    downloadsFolder: 'cypress/downloads',
    
    setupNodeEvents(on, config) {
      // Database seeding task
      on('task', {
        'db:seed': async () => {
          const mongoose = require('mongoose');
          await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodfast_test');
          
          // Clear database
          await mongoose.connection.db.dropDatabase();
          
          // Seed test data
          const User = require('./server_app/API/Models/User');
          const Product = require('./server_app/API/Models/Product');
          const Drone = require('./server_app/API/Models/Drone');
          
          // Create test users
          await User.create([
            {
              name: 'Test Customer',
              email: 'customer@test.com',
              password: 'Password123!',
              role: 'customer'
            },
            {
              name: 'Test Restaurant',
              email: 'restaurant@test.com',
              password: 'Password123!',
              role: 'restaurant'
            },
            {
              name: 'Test Admin',
              email: 'admin@test.com',
              password: 'Admin123!',
              role: 'admin'
            }
          ]);
          
          // Create test products
          await Product.create([
            {
              name: 'Phở Bò',
              price: 45000,
              category: 'food',
              stock: 100
            },
            {
              name: 'Bún Chả',
              price: 40000,
              category: 'food',
              stock: 50
            }
          ]);
          
          // Create test drones
          await Drone.create([
            {
              code: 'DRONE-TEST-001',
              status: 'available',
              battery: 100,
              location: { lat: 21.0285, lng: 105.8542 }
            }
          ]);
          
          await mongoose.disconnect();
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
    
    env: {
      apiUrl: 'http://localhost:5000',
      customerToken: '',
      restaurantToken: '',
      adminToken: ''
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  },
  
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: true,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 15000,
  pageLoadTimeout: 30000,
  
  retries: {
    runMode: 2,
    openMode: 0
  }
});
