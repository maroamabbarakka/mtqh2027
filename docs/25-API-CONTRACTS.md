# 25 — API Contracts, Payload, Errors, Cache, Embedding

Base: `https://WORKER_EXAMPLE.workers.dev/api/v1`. `WORKER_EXAMPLE` placeholder, bukan endpoint aktif. Endpoint publik read-only, response JSON UTF-8; data standar dari `publicEvents` saja.

## Endpoint publik
| Endpoint | Parameter | Response inti |
|---|---|---|
| `GET /events/:eventId` | - | event public info |
| `GET /events/:eventId/districts` | - | 12 kecamatan id/name |
| `GET /events/:eventId/branches` | `enabled` | cabang/golongan public |
| `GET /events/:eventId/schedule` | `date,branchId,limit,cursor` | jadwal published |
| `GET /events/:eventId/standings` | `mode=points\|medals` | 12 rows + policy status |
| `GET /events/:eventId/results` | `branchId,divisionId,limit,cursor` | official results only |
| `GET /events/:eventId/statistics` | - | aggregate non-PII |
| `GET /events/:eventId/news` | `pageSize,cursor,category` | published news summaries |
| `GET /events/:eventId/news/:slug` | - | sanitized published article |
| `GET /events/:eventId/gallery` | `branchId,limit,cursor` | approved photos |

## Envelope response
```json
{
  "success": true,
  "data": {
    "rankingMode": "points",
    "rows": [
      {"districtId": "tiroang", "districtName": "Tiroang",
       "rank": 1, "gold": 2, "silver": 1, "bronze": 1,
       "honorable": 0, "points": 14}
    ]
  },
  "meta": {
    "schemaVersion": "1.0.0", "eventId": "mtqh-pinrang-2027",
    "dataVersion": 12, "generatedAt": "2027-01-15T19:30:00+08:00",
    "isOfficial": false, "isSimulation": true, "stale": false,
    "rankingPolicy": "draft-5-3-1"
  }
}
```
**Contoh di atas murni dummy**; `isOfficial` produksi harus true hanya jika aturan dan hasil disahkan.

## Error envelope
```json
{"success":false,"error":{"code":"RATE_LIMITED","message":"Coba lagi nanti","requestId":"opaque"},"meta":{"schemaVersion":"1.0.0"}}
```
HTTP 400 bad request, 401 unauthenticated, 403 forbidden, 404 not found/no published, 409 conflict/version, 413 photo too large, 422 invalid state, 429 rate limited, 503 unavailable/stale.

## Private Worker operations
`POST /v1/media/sign`, `POST /v1/media/register`, `POST /v1/results/:divisionId/approve`, `POST /v1/results/:divisionId/return`, `POST /v1/news/:articleId/publish`, `POST /v1/roles/assign`; wajib Bearer Firebase JWT dan Zod validation. `Idempotency-Key` required pada approve/publish/register. Private `Cache-Control:no-store`.

### Verifikasi final registrasi (diimplementasikan, belum diaktifkan di UI)

`POST /v1/events/:eventId/registrations/:entryId/verify`

```json
{"idempotencyKey":"UUID_V4","note":"Berkas administrasi telah diperiksa lengkap."}
```

- Role server-trusted: `event_admin` atau `verifier` aktif pada event.
- Actor wajib reviewer yang sebelumnya mengambil pemeriksaan dan berbeda dari pembuat entri.
- Precondition: status `under_review`, eligibility `needs_manual_review`, serta `updateTime` belum berubah.
- Efek atomik: registration menjadi `verified`/`verified_manual` dan satu `eventAudit` deterministik dibuat.
- Replay dengan key, actor, action, dan resource yang sama mengembalikan sukses `replayed:true`; penggunaan ulang key untuk operasi lain ditolak 409.
- Request maksimum 8 KiB, private `no-store`, origin browser harus masuk allowlist, dan bearer token tetap wajib.

### Transisi hasil lomba RES-202

`POST /v1/events/:eventId/results/:resultId/transition`

```json
{"idempotencyKey":"UUID_V4","action":"submit|start_review|return|approve","reason":"Wajib untuk return"}
```

- `submit` hanya Admin Cabang pada scope tugas dan pembuat draft.
- `start_review`, `return`, dan `approve` hanya Admin Event; penginput tidak boleh mereview hasilnya sendiri.
- Pemenang, status `verified`, golongan, serta slot diperiksa ulang pada setiap transisi.
- Approval membuat `officialResults/{divisionId}`, memperbarui submission, dan menulis audit dalam satu commit dengan precondition.
- Replay idempotensi mengembalikan sukses; pemakaian key untuk aksi/resource lain ditolak `409`.
- Endpoint tidak menerima skor dan belum membangun klasemen atau snapshot publik.

## CORS/cache
- Public: CORS `*` hanya read-only dan tanpa credential; cache TTL 30–60s; key normalize query; Vary origin jika origin-specific.
- Private: CORS trusted origin, never reflect arbitrary origin with credentials. Bearer auth tetap perlu.
- `ETag`/`If-None-Match` opsional; gunakan proper 304 response.
- `X-Content-Type-Options: nosniff`, Content-Security-Policy HTML, frame-ancestors untuk embed.

## Compatibility
Perubahan nonbreaking minor versi; perubahan field yang breaking rilis `/api/v2`. Field enum dinormalkan pada `shared` package. API schema tests harus cocok screenshot data di widget.
