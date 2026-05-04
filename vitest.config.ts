import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/js/setup.ts'],
        include: ['tests/js/**/*.test.{ts,tsx}'],
        css: false,
    },
})
