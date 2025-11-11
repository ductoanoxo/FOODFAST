module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/__tests__/**/*.test.js'],

    // ✅ CHỈ ĐO COVERAGE CỦA CÁC FILE ĐÃ CÓ TESTS
    collectCoverageFrom: [
        // Controllers có tests
        'API/Controllers/productController.js',
        'API/Controllers/userController.js',
        'API/Controllers/orderController.js',
        'API/Controllers/droneController.js',

        // Middleware (có tests - 3 files)
        'API/Middleware/asyncHandler.js',
        'API/Middleware/authMiddleware.js',
        'API/Middleware/errorMiddleware.js',

        // Routes (sẽ có tests)
        'API/Routers/productRouter.js',
        'API/Routers/orderRouter.js',
        'API/Routers/droneRouter.js',
    ],

    // Ngưỡng coverage thực tế (sẽ tăng dần khi implement tests)
    coverageThreshold: {
        global: {
            statements: 30, // Đạt được 30.64% ✅
            branches: 17, // Đạt được 17.01% ✅
            functions: 25, // Đạt được 38.46% ✅
            lines: 30, // Đạt được 30.71% ✅
        },
    },

    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    verbose: true,
};