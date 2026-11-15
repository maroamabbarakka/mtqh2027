# 28 — Sumber Teknis dan Rujukan (dicek 15 November 2026)

> Catatan: sumber URL untuk developer. Harga/kuota dapat berubah; sebelum produksi wajib periksa langsung console dan dokumentasi terkini. Mockup dari percakapan bukan sumber data/lomba resmi.

## Firebase resmi
1. [Firebase pricing](https://firebase.google.com/pricing) — Spark vs Blaze, produk yang mengharuskan billing.
2. [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) — sifat Spark, pemakaian dan konsekuensi kuota.
3. [Firestore pricing/free quota](https://firebase.google.com/docs/firestore/pricing) — free: 1 GiB, 50k reads/hari, 20k writes/hari, 20k deletes/hari, egress 10 GiB/bln; backup/PITR/TTL tidak gratis.
4. [Firebase Hosting quotas](https://firebase.google.com/docs/hosting/usage-quotas-pricing) — dokumen diperbarui Nov 2026, storage 10 GB, transfer 10 GB/bln gratis; saat batas tercapai situs bisa dinonaktifkan sementara.
5. [Cloud Storage for Firebase billing changes](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) — Blaze required sejak 3 Februari 2026.
6. [Cloud Firestore rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions) — role checks via rules, access calls limit, getAfter, biaya `get()`.
7. [Firestore transactions/batched writes](https://firebase.google.com/docs/firestore/manage-data/transactions) — atomicity, retries, offline rules.
8. [Firestore quotas](https://firebase.google.com/docs/firestore/quotas) — dokumen maksimum, transaksi, limit API.
9. [Firebase Hosting full config](https://firebase.google.com/docs/hosting/full-config) — SPA rewrite, cache headers, konfigurasi route.
10. [Firebase Auth email/password](https://firebase.google.com/docs/auth/web/password-auth) — sign-in tanpa phone/SMS.

## Cloudinary, Cloudflare
11. [Cloudinary pricing](https://cloudinary.com/pricing) — paket Free, kredit per bulan.
12. [Cloudinary billing/plans](https://cloudinary.com/documentation/billing_and_plans) — 25 kredit/bln dan gabungan storage/bandwidth/transform.
13. [Cloudinary upload images](https://cloudinary.com/documentation/upload_images) — signed upload, API secret server-side, risiko unsigned.
14. [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) — Free 100.000 requests/hari, CPU 10ms, memory 128 MB.
15. [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) — Free, request constraints.

## Konteks daerah
16. [Dokumen RTRW Pemkab Pinrang](https://pmptsp.pinrangkab.go.id/assets/file/1748224849_da15e3ff046291a5c03b.pdf) — menyebut 12 kecamatan dan namanya.
17. [Berita Radio SBL — MTQ XXXIV Kabupaten Pinrang 2026](https://sbl.pinrangkab.go.id/2026/01/21/gema-wahyu-dari-pesisir-lanrisang-mtq-xxxiv-2026-menyalakan-cahaya-al-quran-di-hati-bumi-lasinrang/) — konteks historis, bukan aturan lomba 2027.
18. [UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) — perlu tinjauan pemilik data terkait persetujuan/retensi.

## Verifikasi yang belum tersedia di paket
- Juknis resmi MTQH XXXV Kab. Pinrang 2027.
- SK cabang dan golongan, aturan juara umum/poin, nama dan file logo resmi.
- Tempat/tanggal detail, daftar pengguna dan privacy notice panitia.
Semua ditandai `OPEN` di `21-OPEN-DECISIONS.md`.
