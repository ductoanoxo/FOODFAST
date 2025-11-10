import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.js',
        css: true,
        // Chỉ chạy integration tests
        include: ['src/__tests__/integration/**/*.test.{js,jsx}'],
        exclude: ['node_modules', 'dist', 'src/__tests__/unit/**'],
        testTimeout: 15000, // Integration tests cần thời gian lâu hơn
        hookTimeout: 15000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});