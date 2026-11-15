# 15 — Portal Publik, Widget Embed, Diagram & Sinkronisasi Data

## Prinsip publikasi
Semua informasi publik bersumber dari **snapshot canonical published** yang aman untuk dibagikan. Anonymous users tidak membaca `participants`, `registrations`, `roleAssignments`, `news` private, atau `adminAudit`. Status staleness harus jelas. Perubahan hasil resmi memicu versi snapshot baru.

## Data publik minimum
- Event identity: nama/edisi/tahun/tempat/status, logo verified bila tersedia.
- List 12 kecamatan; konfigurasi cabang-golongan yang `published`.
- Jadwal public; hasil juara yang disahkan; standings poin/medali.
- Statistik agregat: peserta (agregat, tidak PII), status lomba, progres pengesahan.
- Berita/galeri yang disahkan dan telah dipublikasikan.
- `meta`: schemaVersion, generatedAt WITA/UTC, dataVersion, sourceEventId, updatePolicy.

## Metode integrasi
1. **iframe** untuk CMS dan website pihak ketiga: `/embed/klasemen?theme=light|dark&mode=points|medals`.
2. **API JSON** read-only via Cloudflare Workers: `/api/v1/events/:eventId/standings`, dll.
3. **Download CSV/JSON publik** dari UI untuk operator dan media.
4. **Videotron** fullscreen `/display/led?view=standings|news|results`, dapat dimasukkan ke OBS/Resolume browser source.

## Contoh iframe (placeholder, bukan domain aktif)
```html
<iframe src="https://PROJECT_ID.web.app/embed/klasemen?theme=dark&mode=points"
  width="100%" height="640" loading="lazy" title="Klasemen MTQH Pinrang"
  style="border:0;max-width:100%"></iframe>
```
- Publik widget berisi judul, klasemen, legenda poin, `updatedAt`, kredit sumber, tautan "Lihat situs resmi".
- Untuk dukungan iframe lintas website, konfigurasi CSP `frame-ancestors` pada URL embed sesuai kebijakan; halaman `/app/**` wajib anti-framing. Catatan: Firebase Hosting rewrites dan headers mungkin perlu per-rule verifikasi karena routing SPA.
- Implementasi iframe tidak mengandalkan akses cookies ataupun login.

## API contract prinsip
- Base URL `https://<worker-domain>/api/v1` (domain placeholder).
- `GET` only untuk publik; CORS allow GET/HEAD/OPTIONS, `Content-Type: application/json; charset=utf-8`.
- `Cache-Control: public,max-age=30,stale-while-revalidate=60` bila benar-benar aman; ETag jika tersedia; status 304 valid.
- Response `{success:true, data, meta:{schemaVersion,eventId,dataVersion,generatedAt,stale:false}}`.
- Status 429 saat overload; 503/504 saat backend gagal (bisa serve stale dengan flag). Tidak ada `POST` publik yang mengubah data.
- Data sample dan endpoint lengkap: `25-API-CONTRACTS.md`.

## SEO & sharability
Static SPA dapat memuat konten publik setelah hydrate, tetapi bot tertentu tidak membaca JS dan OpenGraph per artikel tidak otomatis; **tidak menjanjikan metadata dinamis tanpa mekanisme build/prerender atau Worker HTML transform**. Prioritas MVP: SEO dasar homepage, routes crawlable, sitemap artikel jika dibuat statis saat deploy manual, robots, canonical dan fallback social card.

## Realtime
Di UI admin gunakan Firestore listeners terbatas. **Publik dan website eksternal memakai polling cache 30–60 dtk**, yang secara fungsional near-real-time tetapi tidak menghabiskan kuota Firestore. Jangan label `LIVE` jika data tak diperbarui.
