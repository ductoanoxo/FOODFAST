module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'API/**/*.js',
        '!API/Models/**',
        '!**/node_modules/**',
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    verbose: true,
};