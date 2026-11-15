# 05 — Information Architecture & URL Routes

## Portal publik (tanpa login)
- `/` beranda (headline, agenda, klasemen top 5, berita utama, countdown jika tanggal ada).
- `/tentang` profil kegiatan & kontak panitia yang diizinkan.
- `/cabang` daftar cabang; `/cabang/:slug` detail golongan & jadwal.
- `/jadwal` filter tanggal, lokasi, cabang, kategori, status.
- `/kafilah` 12 kecamatan; `/kafilah/:slug` ringkasan statistik **publik** (tanpa data sensitif).
- `/hasil` filter cabang & juara; `/hasil/:divisionSlug` detail official hasil.
- `/klasemen` peringkat poin dan medali dengan definisi aturan.
- `/statistik` dashboard ringkasan dan metodologi angka.
- `/berita` dan `/berita/:slug` konten approved/published saja.
- `/galeri` grid foto berizin, filter event/cabang/tanggal.
- `/pengumuman` keputusan resmi yang ditandai published.
- `/embed/klasemen`, `/embed/medali`, `/embed/grafik`, `/embed/hasil-terbaru`, `/display/led`.
- `/aksesibilitas`, `/kebijakan-privasi`, `/sumber-data`.

## Panel pengelola (auth-required)
- `/login`, `/lupa-password`, `/akun-menunggu-aktivasi`.
- `/app/dashboard`, `/app/profil`, `/app/notifikasi`.
- `/app/peserta`, `/app/peserta/baru`, `/app/peserta/:id`, `/app/verifikasi`.
- `/app/kafilah`, `/app/cabang`, `/app/golongan`, `/app/jadwal`, `/app/lokasi`.
- `/app/hasil`, `/app/hasil/input/:divisionId`, `/app/pengesahan`.
- `/app/berita`, `/app/berita/tulis`, `/app/redaksi`, `/app/media`.
- `/app/statistik`, `/app/laporan`, `/app/publikasi`.
- `/app/admin/pengguna`, `/app/admin/peran`, `/app/admin/konfigurasi`, `/app/admin/audit`, `/app/admin/kuota`.

## Sidebar berdasarkan peran
Satu navigasi komponen dengan menu permission-aware dan label grup `Ikhtisar`, `Peserta & Kafilah`, `Lomba & Hasil`, `Publikasi & Media`, `Laporan`, `Administrasi`. Sembunyikan grup tanpa akses; pastikan route guard tetap enforce rule.

## Navigasi mobile
- Bottom bar empat utama: `Beranda`, `Jadwal`, `Klasemen`, `Berita` (publik).
- Admin: bottom bar `Dashboard`, `Peserta/Hasil` (contextual), `Kiriman`, `Menu`; dialog drawer untuk menu lengkap.
- Jangan meletakkan fitur penting di hover-only.

## Routing SPA
Gunakan Firebase Hosting classic rewrite `** -> /index.html`; tangani 404 pada React Router. Halaman API berada di domain Workers terpisah, bukan rewrite ke Firebase Functions. Untuk SEO dan social previews, lihat `24-A11Y-SEO.md`.
