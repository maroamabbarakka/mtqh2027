import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'apps/web/dist')
const port = Number(process.argv[3] ?? 4173)
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml' }

createServer((request, response) => {
  const requested = normalize(decodeURIComponent((request.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  let file = join(root, requested === '/' ? 'index.html' : requested)
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html')
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
  response.setHeader('Cache-Control', 'no-store')
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`))
