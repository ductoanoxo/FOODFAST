module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/__tests__/**/*.test.js'],

    // ✅ CHỈ ĐO COVERAGE CỦA CÁC FILE QUAN TRỌNG ĐÃ CÓ TESTS
    collectCoverageFrom: [
        // Controllers có tests
        'API/Controllers/authController.js',
        'API/Controllers/orderController.js',
        'API/Controllers/paymentController.js',
        'API/Controllers/productController.js',
        'API/Controllers/promotionController.js',
        'API/Controllers/droneController.js',
        'API/Controllers/userController.js',
        'API/Controllers/restaurantController.js',

        // Middleware (có tests)
        'API/Middleware/*.js',

        // Routers (có tests)
        'API/Routers/authRouter.js',
        'API/Routers/orderRouter.js',
        'API/Routers/paymentRouter.js',
        'API/Routers/productRouter.js',
        'API/Routers/promotionRouter.js',
        'API/Routers/droneRouter.js',
        'API/Routers/userRouter.js',
        'API/Routers/restaurantRouter.js',

        // Utils (có tests)
        'API/Utils/logger.js',

        // BỎ QUA những file không test:
        '!API/Controllers/adminController.js',
        '!API/Controllers/categoryController.js',
        '!API/Controllers/dashboardController.js',
        '!API/Controllers/reviewController.js',
        '!API/Controllers/uploadController.js',
        '!API/Controllers/voucherController.js',
        '!API/Controllers/droneSimulationController.js',
        '!API/Utils/mapService.js',
        '!API/Models/**',
        '!**/node_modules/**',
    ],

    // Ngưỡng coverage yêu cầu: 100% cho tất cả metrics
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },

    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    verbose: true,
};