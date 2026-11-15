# 02 — Batasan, Keputusan Tetap, dan Hal yang Belum Final

## Keputusan TETAP (harus ditaati)
- Platform **Firebase Spark**. Tidak ada pesan "upgrade to Blaze" sebagai solusi teknis.
- Web SPA statis mobile-friendly/PWA; hosting Firebase Hosting klasik.
- Tidak ada sistem penilaian, formulir hakim, angka skor cabang, maupun dashboard juri.
- Pendaftaran dilakukan admin kafilah; admin cabang memasukkan **hasil lomba/juara**; admin pusat menyetujui.
- Panitia/user login dengan izin contributor boleh mengirim foto, narasi, berita; redaksi harus memoderasi.
- Multi-role dan multi-scope: event, kecamatan, cabang, opsional golongan.
- Klasemen otomatis + portal publik + data integrasi website lain + layar event.
- Referensi estetika dua PNG dari percakapan, tapi kesalahan kontennya **jangan disalin**.

## Yang MASIH DRAFT / bukan fakta resmi
- Tanggal persis kegiatan Januari 2027; jam, lokasi panggung, venue, narasumber.
- Jumlah cabang/golongan final; referensi nasional (8 cabang/24 golongan) hanya kerangka konfigurasi.
- Cabang Hadis: **opsional, nonaktif hingga disahkan**.
- Kuota peserta dan batas umur masing-masing nomor lomba.
- Aturan juara harapan, juara bersama, tie-break, bobot poin, apakah juara umum berdasarkan poin atau medali.
- Pembagian peran final, identitas penanggung jawab, daftar Dewan Hakim, tanda tangan SK.
- Nama domain, logo resmi dan brand guideline yang telah diotorisasi.

## Data resmi yang aman untuk seed
12 kecamatan Kabupaten Pinrang: `Batulappa`, `Cempa`, `Duampanua`, `Lanrisang`, `Lembang`, `Mattiro Bulu`, `Mattiro Sompe`, `Paleteang`, `Patampanua`, `Suppa`, `Tiroang`, `Watang Sawitto`. Sumber Pemkab Pinrang ada pada `28-SOURCES.md`. Gunakan ID stabil slug (mis. `watang-sawitto`).

## Pemetaan koreksi mockup
| Temuan di gambar | Perlakuan saat coding |
|---|---|
| "2025" / kabupaten atau provinsi fiktif | Ganti MTQH XXXV Kab. Pinrang 2027; tanggal detail `Segera diumumkan` |
| "Penilaian", "Dewan Hakim input nilai" | **Hapus** dari navigasi dan alur aplikasi; gunakan `Input Hasil Juara` |
| Jumlah 1.248, 56, 22, 142 dan foto generatif | Data dummy hanya environment demo, jelas label simulasi; produksi hitung dari database |
| Logo MTQH generik / ilustrasi masjid | Placeholder. Logo resmi hanya dipakai jika berkas asli terverifikasi dan diizinkan |
| API domain fiktif | Jangan gunakan URL contoh sebagai domain aktif |
| Sidebar terlalu padat | Gunakan navigasi grup expandable dan versi mobile yang ringkas |

## Hierarki sumber kebenaran
1. Keputusan panitia/juknis yang secara resmi disahkan (jika kemudian tersedia).
2. Instruksi pengguna yang eksplisit di percakapan ini.
3. `02-SCOPE-DECISIONS.md` dan dokumen spesifikasi terbaru.
4. Mockup hanya pedoman estetika, **tidak** sebagai dasar data, konten, nama daerah atau fitur.

Semua perubahan keputusan dicatat dalam log administrasi aplikasi dan dokumen `21-OPEN-DECISIONS.md`.
