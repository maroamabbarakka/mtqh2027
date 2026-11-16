const baseUrl = (process.env.MTQH_WORKER_URL ?? 'https://mtqh-pinrang-api.lpplradiosbl.workers.dev').replace(/\/$/, '')
const allowedOrigin = process.env.MTQH_ALLOWED_ORIGIN ?? 'https://mtqhpinrang2027.web.app'
const deniedOrigin = 'https://origin-tidak-diizinkan.invalid'

const checks = []

async function check(name, request, expectedStatus, validate = () => true) {
  const startedAt = performance.now()
  const response = await fetch(request)
  const durationMs = Math.round((performance.now() - startedAt) * 10) / 10
  const valid = response.status === expectedStatus && (await validate(response))
  checks.push({ name, status: response.status, durationMs, valid })
  if (!valid) process.exitCode = 1
}

await check('health', `${baseUrl}/health`, 200, async (response) => {
  const body = await response.json()
  return body?.success === true && body?.data?.status === 'ok' && body?.meta?.schemaVersion === 'v1'
})

await check(
  'preflight origin resmi',
  new Request(`${baseUrl}/v1/privileged/validate`, {
    method: 'OPTIONS',
    headers: {
      Origin: allowedOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  }),
  204,
  async (response) => response.headers.get('access-control-allow-origin') === allowedOrigin,
)

await check(
  'request tanpa token',
  new Request(`${baseUrl}/v1/privileged/validate`, {
    method: 'POST',
    headers: { Origin: allowedOrigin, 'content-type': 'application/json' },
    body: '{}',
  }),
  401,
  async (response) => (await response.json())?.error?.code === 'missing_token',
)

await check(
  'origin tidak diizinkan',
  new Request(`${baseUrl}/v1/privileged/validate`, {
    method: 'POST',
    headers: { Origin: deniedOrigin, 'content-type': 'application/json' },
    body: '{}',
  }),
  403,
  async (response) => (await response.json())?.error?.code === 'origin_denied',
)

for (const result of checks) {
  console.log(`${result.valid ? 'PASS' : 'FAIL'} ${result.name}: HTTP ${result.status} (${result.durationMs} ms)`)
}

if (process.exitCode) {
  console.error('Smoke test produksi gagal. Tidak ada operasi tulis yang dijalankan.')
} else {
  console.log('Smoke test produksi lulus. Tidak ada operasi tulis yang dijalankan.')
}
