import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './vitest.setup.js',
        css: true,
        // Chạy TẤT CẢ tests (unit + integration) cho coverage
        include: ['src/__tests__/**/*.test.{js,jsx}'],
        exclude: ['node_modules', 'dist'],
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        testTimeout: 15000,
        hookTimeout: 15000,
        silent: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'src/main.jsx',
                '**/*.config.js',
                '**/dist/**',
                '**/*.test.{js,jsx}',
                'src/__tests__/**',
            ],
            // Báo cáo coverage cho TẤT CẢ tests
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
