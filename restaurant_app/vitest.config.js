import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom', // Dùng happy-dom thay vì jsdom
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
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'clover'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'src/main.jsx',
                '**/*.config.js',
                '**/dist/**',
                '**/*.test.{js,jsx}',
                'src/__tests__/**',
            ],
            include: ['src/**/*.{js,jsx}'],
            all: true,
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 60,
                statements: 70,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});