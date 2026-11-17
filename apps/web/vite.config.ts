import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

const safeCwd = process.env.MTQH_VITE_CWD ?? process.cwd()

export default defineConfig({
  root: safeCwd,
  publicDir: resolve(safeCwd, 'public'),
  envDir: resolve(safeCwd, '..', '..'),
  plugins: [react(), tailwindcss()],
  resolve: { preserveSymlinks: true, alias: { '@': resolve(safeCwd, 'src') } },
  server: { port: 5173 },
  test: { environment: 'node' },
})
