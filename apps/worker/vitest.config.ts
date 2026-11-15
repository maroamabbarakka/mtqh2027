import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: process.cwd(),
  resolve: { preserveSymlinks: true, alias: { '@': resolve(process.cwd(), 'src') } },
  test: { environment: 'node' },
})
