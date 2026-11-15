# Codex Phase 03 — Peserta, Regu, Verifikasi & Jadwal

## Baca
`docs/12-REGISTRATION-SCHEDULING.md`, `docs/08-FIRESTORE-DATA-MODEL.md`, `docs/04-WORKFLOWS.md`.

## Implementasi
1. CRUD master event/cabang/division/kafilah sebagai data configurable bertanda draft.
2. Form pendaftaran individual dan regu dengan React Hook Form + Zod + wizard review.
3. Registrations status machine; verifier review dan correction reason.
4. `participants` privat, masking data sensitif; hindari unggah identitas ke Cloudinary publik.
5. Import CSV preview & dedup, pagination, filter, export per role.
6. Jadwal cabang/arena/sesi, status draft/published dan filter publik.
7. Audit perubahan, timezone WITA, test negara/usia default 'pending juknis'.

## UAT
- Admin kafilah Tiroang mendaftarkan individu & regu; kecamatan lain tidak bisa.
- Verifikator menolak/minta revisi/mengesahkan; operator melihat eligible entries sesuai golongan.
- Orang tidak terduplikasi pada nomor lomba sama.
- Tidak ada akses anonymous ke data peserta privat.
