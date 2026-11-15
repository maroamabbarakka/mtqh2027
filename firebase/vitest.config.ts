import { defineConfig } from 'vitest/config'
export default defineConfig({ root: process.cwd(), resolve: { preserveSymlinks: true }, test: { environment: 'node', include: ['firebase/tests/**/*.test.ts'], fileParallelism: false, testTimeout: 15_000, hookTimeout: 15_000 } })
