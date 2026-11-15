import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const blocked = /(TOKEN|SECRET|PRIVATE|PASSWORD|API_KEY|OPENAI|ANTHROPIC|CODEX)/i
const safeEnvironment = Object.fromEntries(Object.entries(process.env).filter(([key]) => !blocked.test(key) && key !== 'DEBUG'))
const firebaseCli = resolve('node_modules/firebase-tools/lib/bin/firebase.js')
const command = 'node scripts/vite-safe.mjs vitest run --config firebase/vitest.config.ts'
const child = spawn(process.execPath, [firebaseCli,'emulators:exec','--only','firestore','--project','mtqh-pinrang-2027-demo',command], { stdio:'inherit', env:safeEnvironment })
child.on('exit',(code)=>process.exit(code??1))
