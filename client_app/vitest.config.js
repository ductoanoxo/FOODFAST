import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom', // Dùng happy-dom thay vì jsdom để tránh webidl-conversions error
        setupFiles: './vitest.setup.js',
        css: true,
        // Chỉ chạy unit tests (không bao gồm integration tests)
        include: ['src/__tests__/unit/**/*.test.{js,jsx}'],
        exclude: ['node_modules', 'dist', 'src/__tests__/integration/**'],
        // Workaround cho webidl-conversions error trong CI
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        // Tăng timeout cho CI environment
        testTimeout: 10000,
        hookTimeout: 10000,
        // Silent mode để tránh console spam
        silent: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/main.jsx',
                '**/*.config.js',
                '**/dist/**',
                '**/*.test.{js,jsx}',
                'src/__tests__/**',
            ],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});