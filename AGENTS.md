# AGENTS.md — Instruksi Wajib untuk Codex / AI Coding Agent

Dokumen ini berlaku pada seluruh folder repository ketika paket digunakan sebagai sumber pembangunan aplikasi.

## Misi
Implementasikan **MTQH PINRANG DIGITAL**, platform real-world yang dapat beroperasi sebagai SPA mobile-friendly untuk MTQH XXXV Kabupaten Pinrang 2027, **tanpa e-scoring**, dan kompatibel dengan **Firebase Spark tanpa mengaktifkan billing/Blaze**. Cakupan telah dirinci di `docs/`.

## Urutan membaca
1. `docs/02-SCOPE-DECISIONS.md` — sumber kebenaran dan larangan.
2. `docs/09-SPARK-COST-GUARDRAILS.md` — audit kompatibilitas biaya.
3. `docs/06-DESIGN-SYSTEM.md`, `docs/07-UI-SCREEN-SPECS.md`, `mockups/README.md` — acuan visual.
4. `docs/08-FIRESTORE-DATA-MODEL.md`, `docs/03-RBAC.md`, `docs/10-SECURITY-AUTH.md`.
5. Dokumen modul yang sedang dikerjakan, `docs/18-TEST-QA.md`, `docs/29-RELEASE-CHECKLIST.md`.

## Aturan perubahan
- Bangun bertahap sesuai `docs/20-IMPLEMENTATION-PLAN.md`; satu PR per feature slice; hindari rewrite besar tanpa alasan.
- Gunakan TypeScript strict, React, Vite, Tailwind, shadcn/ui, React Router, TanStack Query untuk data non-realtime, Firebase Modular SDK, Zod, Recharts, React Hook Form, Vitest, Playwright, emulator.
- Setiap modul wajib memiliki loading, empty, error, permission-denied, offline/stale, dan success states.
- Tulisan UI Bahasa Indonesia yang jelas, format tanggal WITA, waktu 24 jam.
- Jangan hardcode data resmi, pemenang, batas usia, golongan maupun bobot juara; gunakan konfigurasi admin dengan label *belum disahkan*.
- Pakai ID teknis stabil dan struktur event-scoped. Pendaftaran anak tidak boleh menayangkan tanggal lahir/NIK di halaman publik.
- Hasil juara harus disahkan oleh role berbeda dari penginput jika memungkinkan; publikasi harus atomik dan idempoten.
- Jangan expose Cloudinary secret, Firebase service account, private key, ataupun peran 'admin' berdasarkan nilai yang dapat diedit pengguna.
- Jangan menaruh foto Base64 di Firestore. Jangan menyimpan kredensial ke git.
- Jangan membuat menu atau tabel Dewan Hakim yang menginput penilaian/skor/komponen nilai. Jika mockup menampilkan istilah itu, **abaikan dan ganti dengan `Hasil Lomba`**.
- Kontrak API publik harus versioned, read-only, allowlisted, cached, dan mengandung `updatedAt/dataVersion`.
- Publik tidak boleh dapat melihat kiriman berita draft, media belum dimoderasi, data administrasi pribadi atau audit log.
- Bila kuota mendekati batas, tampilkan status degrade dan stop fitur nonkritis; **jangan meminta upgrade paket**.

## Definition of Done per perubahan
- Build/lint/typecheck/tes unit dan integrasi lulus.
- Rules diuji dengan emulator: akses resmi boleh, akses lintas-role/wilayah ditolak.
- Layout sesuai mockup tanpa copy elemen data salah; screenshot before/after pada viewport wajib.
- Operasi tulis mempunyai idempotency key/audit; validasi server-side untuk operasi sensitif.
- Dokumentasikan env baru, index Firestore, keamanan dan dampak kuota.
- Perbarui checklist dan changelog.

## Jika ada informasi ambigu
Pilih default konfigurabel aman (*feature flag off*, draft-only, akses minimal). Catat di `docs/21-OPEN-DECISIONS.md`; jangan mengarang keputusan resmi panitia. Jika perlu interaksi akun nyata, tampilkan langkah aman; jangan klaim sudah deploy.
