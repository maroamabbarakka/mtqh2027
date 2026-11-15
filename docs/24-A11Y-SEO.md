# 24 — Accessibility, SEO, Bahasa dan Kepatuhan Konten

## Accessibility
- Semantik H1 tunggal dan heading terurut; setiap icon-only button memiliki `aria-label`.
- Focus ring terlihat, urutan tab logis, skip-to-content, modal focus trap.
- Form setiap input berlabel dan error yang dapat dibaca screenreader.
- Status tidak mengandalkan warna saja; grafik punya data table/teks ringkasan.
- Min target 44×44 px; kontras normal ≥4.5:1 (WCAG 2.2 AA).
- Motion dikurangi bila `prefers-reduced-motion`; bebas animasi berat.
- Foto berita memiliki alt text faktual, tidak spekulatif.
- Tabel pada mobile dapat di-scroll di container tanpa menggeser seluruh layar.

## Bahasa dan zona waktu
- Bahasa default Indonesia, `lang="id"`, WITA `Asia/Makassar`, format `dd MMM yyyy`, jam `HH.mm WITA`.
- Simpan Firestore Timestamp UTC dan render dengan Intl explicit timezone; tes lintas zona perangkat.
- Leksikon konsisten: `Kafilah`, `Cabang`, `Golongan`, `Nomor Lomba`, `Juara I/II/III`, `Harapan I/II/III`, `Hasil Disahkan`, `Klasemen Poin`, `Klasemen Medali`.
- Jangan gunakan istilah `Penilaian` pada menu, karena bukan fitur aplikasi.

## SEO static SPA
- Meta home: title, description, canonical, OG image umum; sitemap statis untuk route publik inti.
- Slug berita unik, valid, lowercase; link share bekerja meskipun preview social mungkin generic jika artikel tidak diprerender.
- Jangan menjanjikan SSR/metadata per artikel otomatis dengan Firebase Hosting classic SPA; solusi no-billing harus dirancang dan diuji sendiri sebelum diaktifkan.
- `noindex` pada `/app/**`, `/login`, preview/draft; no accidental indexing admin data.
- robots.txt dan CSP disesuaikan kebutuhan embed public.

## Konten identitas
- Logo Pemkab Pinrang/MTQH resmi hanya dari asset sah; gambar generatif pada mockup tidak boleh disalin sebagai logo resmi.
- Informasi tanggal/tempat dan juara harus berasal dari panitia terverifikasi.
- Anak-anak: nama/foto perlu kebijakan persetujuan publikasi dan minimisasi data; jangan tampilkan umur lengkap/NIK/nomor kontak di publik.
