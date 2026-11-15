# 20 — Roadmap Implementasi, Ticket Backlog, dan Gate

## Prinsip delivery
Vertical slices dapat didemokan. Jangan menunggu seluruh UI selesai sebelum menguji aturan keamanan. Urutkan **data dan keputusan resmi -> input -> approval -> snapshot publik**. Target waktu bersifat perkiraan internal dan tidak menjamin selesai; gunakan definition of done dan gate alih-alih janji tanggal.

## Sprint 0 — Audit & fondasi (P0)
- FND-001 monorepo workspace + lint/prettier/TS strict.
- FND-002 SPA Router + shell app/public + design token.
- FND-003 emulator Auth/Firestore + seed dummy 12 kecamatan.
- FND-004 Auth + protected routes + initial RBAC backend and negative tests.
- FND-005 CI build/test + `AGENTS.md` onboarding + env validation.
**Gate:** login dummy dan 403 scope berfungsi; build deployable ke Hosting klasik tanpa Blaze.

## Sprint 1 — Master data & registrasi (P0)
- REG-101 CRUD event/cabang/golongan/distrik draft (admin only).
- REG-102 registrasi individu & regu; form wizard & status.
- REG-103 verifikasi, revisions, audit, pagination.
- REG-104 data export per scope.
**Gate:** uji 12 kafilah, duplikasi, privasi, role.

## Sprint 2 — Hasil & klasemen (P0)
- RES-201 halaman input hasil juara individual/beregu.
- RES-202 Worker approval + auth verification + preconditions.
- RES-203 fungsi deterministik standings; policy config draft/approved.
- RES-204 snapshot versioning + public standings + koreksi.
**Gate:** 100% test idempotensi, koreksi, scope and official-only.

## Sprint 3 — Portal publik & dashboard (P0)
- PUB-301 admin KPI with actual data, filtering.
- PUB-302 public homepage, hasil, klasemen, statistik.
- PUB-303 responsive charts & mobile navbar.
- PUB-304 public snapshot API cached.
**Gate:** visual screenshots, no PII leak, cache performance.

## Sprint 4 — News & media (P1)
- CMS-401 composer news + moderation queue.
- CMS-402 Cloudinary signed upload Worker + metadata + compression.
- CMS-403 gallery, article detail, publish path.
- CMS-404 editorial QA and social share templates.
**Gate:** uploader role-valid, no drafts publicly readable.

## Sprint 5 — Integrasi, laporan & stabilisasi (P1)
- API-501 JSON endpoints versioned/cached and schema tests.
- API-502 iframe widgets, videotron mode.
- RPT-503 Excel/CSV/PDF export with scope.
- OPS-504 quota monitoring hints, disaster runbook, backup.
- QA-505 E2E cross-device/security/load and UAT.
**Gate:** seluruh checklist release, event rules fixed by authorised admin.

## Prioritas jika waktu sempit
1. Login & RBAC -> peserta -> verifikasi -> input hasil -> pengesahan -> klasemen resmi.
2. Portal publik klasemen dan jadwal.
3. Berita teks & foto/moderasi.
4. API/embed LED, laporan lanjutan, efek UI.
**Tidak boleh mengorbankan keamanan dan approval demi efek visual.**

## Implementasi Codex
Gunakan berurutan prompt di `prompts/00-MASTER-PROMPT.md` lalu `prompts/01` sampai `prompts/08`. Setelah setiap fase agent wajib melaporkan: file dibuat, perintah dijalankan, tes, screenshot, risiko, apa yang belum selesai, dan acceptance yang dilalui.
