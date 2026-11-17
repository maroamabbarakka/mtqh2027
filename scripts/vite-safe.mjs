import { spawn, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
if (!args.length) throw new Error('Perintah Vite/Vitest wajib diberikan.')

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let commandCwd = process.cwd()
let drive = null
let tempRoot = null

const isBuild = args[0] === 'vite' && args[1] === 'build'
const isVite = args[0] === 'vite'

if (process.platform === 'win32' && repoRoot.includes('#') && isVite) {
  tempRoot = join(tmpdir(), 'mtqh-pinrang-vite-safe')
  rmSync(tempRoot, { recursive: true, force: true })
  const tempWeb = join(tempRoot, 'apps', 'web')
  mkdirSync(tempWeb, { recursive: true })
  for (const path of ['src', 'public', 'index.html', 'package.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json']) cpSync(join(repoRoot, 'apps', 'web', path), join(tempWeb, path), { recursive: true })
  for (const logo of ['Logo MTQH XXXV Pinrang 2027.png', 'Lambang LPTQ Kabupaten Pinrang.png', 'Logo_Pinrang.png']) cpSync(join(repoRoot, logo), join(tempRoot, logo))
  for (const envFile of ['.env.local', '.env.emulator']) if (existsSync(join(repoRoot, envFile))) cpSync(join(repoRoot, envFile), join(tempRoot, envFile))
  symlinkSync(join(repoRoot, 'apps', 'web', 'node_modules'), join(tempWeb, 'node_modules'), 'junction')
  symlinkSync(join(repoRoot, 'node_modules'), join(tempRoot, 'node_modules'), 'junction')
  commandCwd = tempWeb
}

if (process.platform === 'win32' && repoRoot.includes('#') && !isVite) {
  for (const candidate of ['V:', 'W:', 'X:', 'Y:']) {
    if (!existsSync(`${candidate}\\`)) { drive = candidate; break }
  }
  if (!drive) throw new Error('Tidak tersedia drive virtual untuk menangani karakter # pada path Vite.')
  const mounted = spawnSync('subst', [drive, repoRoot], { stdio: 'inherit' })
  if (mounted.status !== 0) process.exit(mounted.status ?? 1)
  commandCwd = `${drive}\\${relative(repoRoot, process.cwd())}`
}

const [tool, ...toolArgs] = args
const entries = { vite: 'node_modules/vite/bin/vite.js', vitest: 'node_modules/vitest/vitest.mjs' }
const entry = entries[tool]
if (!entry) throw new Error(`Tool tidak didukung: ${tool}`)
const localEntry = resolve(commandCwd, entry)
const activeRoot = drive ? `${drive}\\` : (tempRoot ?? repoRoot)
const workspaceEntry = resolve(activeRoot, entry)
const toolEntry = existsSync(localEntry) ? localEntry : workspaceEntry
const child = spawn(process.execPath, [toolEntry, ...toolArgs], {
  cwd: commandCwd,
  stdio: 'inherit',
  env: { ...process.env, MTQH_VITE_CWD: commandCwd },
})

const cleanup = () => {
  if (drive) spawnSync('subst', [drive, '/D'])
  if (tempRoot) rmSync(tempRoot, { recursive: true, force: true })
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { child.kill(signal); cleanup() })
child.on('exit', (code) => {
  if (code === 0 && tempRoot) {
    const output = join(repoRoot, 'apps', 'web', 'dist')
    rmSync(output, { recursive: true, force: true })
    cpSync(join(tempRoot, 'apps', 'web', 'dist'), output, { recursive: true })
  }
  cleanup(); process.exit(code ?? 1)
})
