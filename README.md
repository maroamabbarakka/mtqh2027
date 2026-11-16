# MTQH PINRANG DIGITAL *(nama kerja)* — Developer Handoff

**Paket spesifikasi implementasi untuk VS Code/Codex**  
Event: **MTQH XXXV Kabupaten Pinrang 2027** — rencana **Januari 2027**, tuan rumah **Kecamatan Tiroang, Kabupaten Pinrang**.  
Versi dokumen: **1.0 | 15 November 2026**. Bahasa proyek: Indonesia. Zona waktu: `Asia/Makassar` (WITA/UTC+08:00).

> **Status implementasi:** Fondasi UI, Auth/RBAC, profil akun, master data draft REG-101, pendaftaran peserta/regu REG-102, alur pemeriksaan administratif, ekspor CSV privat REG-104, dan alur hasil tepercaya RES-202 telah dibangun. Worker dan SPA tersedia pada kanal produksi teknis untuk UAT, dengan IAM serta secret server terpasang. Kanal ini **belum boleh diumumkan sebagai rilis resmi**: akun panitia nyata, keputusan lomba, privasi, token lintas-role, dan sign-off UAT belum selesai; statistik/golongan contoh tetap simulasi.

## Menjalankan aplikasi

Prasyarat: Node.js 22 atau lebih baru dan npm.

```bash
npm install
npm run dev
```

Quality gate lengkap:

```bash
npm run check
```

Pengembangan Auth/RBAC dengan emulator dijalankan pada terminal terpisah:

```bash
npm run emulators
npm run seed:emulator
npm run dev:emulator
```

Akun emulator memakai domain `example.test` dan kata sandi sementara `123456`. Setelah login pertama, semua akun dipaksa mengganti kata sandi sebelum dapat membuka modul lain. Data ini khusus emulator dan tidak boleh dibuat ulang pada Firebase produksi.

| Fungsi demo | Email emulator |
|---|---|
| Super Admin | `superadmin@example.test` |
| Admin Event | `admin.event@example.test` |
| Pengawas | `pengawas@example.test` |
| Admin Kafilah Tiroang | `admin.tiroang@example.test` |
| Admin Cabang Tilawah | `cabang.tilawah@example.test` |
| Verifikator | `verifikator@example.test` |
| Editor | `editor@example.test` |
| Kontributor | `kontributor@example.test` |

Pengujian rules mandiri: `npm run test:rules`. Pengujian alur login/profil dengan emulator aktif: `npm run test:e2e`.

Master data tersedia pada `/app/pengaturan` untuk akun Super Admin dan Admin Event. Seed cabang/golongan adalah referensi draft, selalu nonaktif, dan tidak boleh dianggap sebagai keputusan resmi panitia.

Halaman `/app/peserta` menyediakan ekspor CSV privat bagi Super Admin, Admin Event, dan Admin Kafilah. Ekspor hanya mencakup maksimal 50 entri yang sudah lolos scope Firestore dan filter aktif; file tidak memuat NIK, tanggal lahir, kontak, catatan privat, actor UID, atau audit log.

Build produksi tersedia di `apps/web/dist`. Konfigurasi `firebase.json` hanya menargetkan Firebase Hosting klasik dan Firestore; deployment tidak dijalankan otomatis.

Worker lokal menggunakan `apps/worker/.dev.vars` yang tidak boleh masuk Git. Salin placeholder dari `.dev.vars.example`, gunakan service account khusus dengan IAM minimum, lalu jalankan `npm exec wrangler dev -w @mtqh/worker`. Worker produksi aktif di `https://mtqh-pinrang-api.lpplradiosbl.workers.dev`; jalankan `npm run smoke:production` untuk pemeriksaan nonmutasi. Endpoint tulis hanya boleh diuji dengan akun Firebase Auth produksi dan scope yang sah.

## Sasaran produk
Platform tunggal yang mobile-first dan profesional untuk manajemen peserta 12 kecamatan, jadwal, input **hasil juara tanpa penilaian hakim**, klasemen poin/medali, peliputan berita dan foto oleh panitia, redaksi/mode moderasi, portal publik, embed untuk situs lain, API data publik, dan layar videotron. Role dan scope akses harus dibatasi secara ketat.

## Pagar utama (non-negotiable)
1. **Firebase Spark sepanjang pengembangan dan produksi — tidak mengaktifkan Blaze/billing.** Gunakan Firebase Auth Email/Password, Cloud Firestore Standard, Firebase Hosting klasik untuk SPA statis.
2. **DILARANG** Firebase Cloud Storage (per 3 Feb 2026 mensyaratkan Blaze), Cloud Functions, Firebase App Hosting, SSR yang butuh Cloud Run, layanan berbayar otomatis, OTP SMS.
3. **Tidak ada e-scoring/penilaian Dewan Hakim.** Operator hanya menginput pemenang dari keputusan resmi, lalu admin pusat mengesahkan.
4. Media: Cloudinary Free melalui tanda tangan *server-side* di Cloudflare Workers Free; jangan mengekspos secret. Validasi kuota dan kebijakan masing-masing provider.
5. Sebelum hasil disahkan, status internal tidak boleh mengubah klasemen publik. Privasi peserta (terutama anak) didahulukan.
6. Jangan mengganti identitas, logo resmi, lokasi, jadwal, dan juara dengan data buatan. Mockup **referensi estetika**, bukan sumber data resmi dan bukan spesifikasi fitur penilaian.

## Navigasi cepat
| Urusan | Dokumen |
|---|---|
| Indeks seluruh dokumen | [`INDEX-DOKUMEN.md`](INDEX-DOKUMEN.md) |
| Mulai coding dengan Codex | [`AGENTS.md`](AGENTS.md), [`prompts/00-MASTER-PROMPT.md`](prompts/00-MASTER-PROMPT.md) |
| PRD & batas proyek | [`docs/01-PRD.md`](docs/01-PRD.md), [`docs/02-SCOPE-DECISIONS.md`](docs/02-SCOPE-DECISIONS.md) |
| UI dari mockup | [`docs/06-DESIGN-SYSTEM.md`](docs/06-DESIGN-SYSTEM.md), [`docs/07-UI-SCREEN-SPECS.md`](docs/07-UI-SCREEN-SPECS.md), [`mockups/README.md`](mockups/README.md) |
| Role & keamanan | [`docs/03-RBAC.md`](docs/03-RBAC.md), [`docs/10-SECURITY-AUTH.md`](docs/10-SECURITY-AUTH.md) |
| Skema database & state | [`docs/08-FIRESTORE-DATA-MODEL.md`](docs/08-FIRESTORE-DATA-MODEL.md), [`docs/04-WORKFLOWS.md`](docs/04-WORKFLOWS.md) |
| Spark & media | [`docs/09-SPARK-COST-GUARDRAILS.md`](docs/09-SPARK-COST-GUARDRAILS.md), [`docs/14-MEDIA-BACKEND.md`](docs/14-MEDIA-BACKEND.md) |
| Juara, medali, poin | [`docs/11-RESULTS-STANDINGS.md`](docs/11-RESULTS-STANDINGS.md) |
| Berita/portal & API | [`docs/13-CMS-EDITORIAL.md`](docs/13-CMS-EDITORIAL.md), [`docs/15-PUBLIC-EMBED.md`](docs/15-PUBLIC-EMBED.md), [`docs/25-API-CONTRACTS.md`](docs/25-API-CONTRACTS.md) |
| Test, deploy, operasional | [`docs/18-TEST-QA.md`](docs/18-TEST-QA.md), [`docs/19-DEPLOYMENT-OPERATIONS.md`](docs/19-DEPLOYMENT-OPERATIONS.md) |
| Jadwal dan backlog | [`docs/20-IMPLEMENTATION-PLAN.md`](docs/20-IMPLEMENTATION-PLAN.md) |
| Keputusan terbuka & progres | [`docs/21-OPEN-DECISIONS.md`](docs/21-OPEN-DECISIONS.md), [`docs/30-IMPLEMENTATION-LOG.md`](docs/30-IMPLEMENTATION-LOG.md) |
| Sumber & kesiapan rilis | [`docs/28-SOURCES.md`](docs/28-SOURCES.md), [`docs/29-RELEASE-CHECKLIST.md`](docs/29-RELEASE-CHECKLIST.md) |

## Struktur paket
- `docs/`: spesifikasi produk, teknis, tata kelola, keamanan, UI, testing, operasional.
- `prompts/`: urutan instruksi Codex yang dapat disalin per fase tanpa terlalu banyak konteks sekaligus.
- `mockups/`: **dua PNG mockup dari percakapan** + matriks koreksi ketidakakuratan.
- `templates/`: contoh konfigurasi, skema data, checklist (tanpa rahasia akun).
- `AGENTS.md`: instruksi tetap bagi agent coding.

## Alur serah terima yang disarankan
1. Ekstrak ZIP; buka folder ini di VS Code.
2. Ikuti urutan baca wajib di `AGENTS.md`: scope → guardrail Spark → desain → data/RBAC/keamanan → dokumen modul dan QA.
3. Berikan `prompts/00-MASTER-PROMPT.md` kepada Codex lalu jalankan prompt fase satu per satu.
4. Lakukan pengembangan dengan Firebase Emulator Suite terlebih dahulu. Jangan buat project berbayar.
5. Minta review UI visual pada 360, 390, 768, 1024, 1440 px dan lakukan tes penolakan akses lintas-role.
6. Sebelum produksi, cek seluruh `docs/29-RELEASE-CHECKLIST.md`, konfirmasi data resmi panitia, dan audit kuota.

**Sumber regulasi produk teknis** dan tanggal verifikasi tersedia di `docs/28-SOURCES.md`. Harga/kuota dapat berubah, maka validasi ulang sebelum deployment.
