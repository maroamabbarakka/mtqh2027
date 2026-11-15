# 00 — Ringkasan Eksekutif dan Konteks

## Latar
MTQH XXXV Kabupaten Pinrang direncanakan Januari 2027, dengan tuan rumah Kecamatan Tiroang. Pada tahap sekarang, panitia masih rapat persiapan dan belum memiliki juknis lengkap. Aplikasi harus fleksibel dan berfungsi dengan konfigurasi sementara yang diberi label **draft**, bukan aturan resmi.

## Nilai utama
- **Satu sumber data** untuk 12 kecamatan, peserta, regu, cabang, golongan, jadwal, hasil dan berita.
- **Input terdesentralisasi**: admin kafilah menangani peserta, admin cabang menangani status dan hasil, kontributor mengirim liputan.
- **Kontrol publikasi terpusat**: verifikasi administrasi, pengesahan hasil, redaksi berita.
- **Kepercayaan publik**: data publik hanya data berstatus published/approved; ada waktu pembaruan dan log koreksi.
- **Mudah diintegrasikan**: API baca saja, iframe widget, fullscreen videotron, ekspor laporan.
- **Murah berkelanjutan**: Firebase Spark tanpa billing dan eksternal gratis dengan batas kuota.

## Bukan bagian aplikasi
Penjurian, penilaian per hakim, skor tajwid/suara/lagu, sistem juri digital, penghitungan nilai lomba, pembayaran/pendaftaran berbayar, SMS OTP, pesan massal berbayar, AI API berbayar, video hosting besar.

## Indikator keberhasilan
- Admin yang hanya ditugaskan pada Tilawah tidak dapat mengubah hasil Tahfiz.
- Tidak ada penghargaan ganda bagi peserta/regu yang sama dalam satu nomor lomba.
- Klasemen berubah hanya setelah pengesahan, tanpa double-counting saat pengajuan ulang.
- Website publik nyaman dibaca pada layar 360 px dan 1440 px.
- Berita dan foto dari panitia dapat dikirim, dimoderasi, dan diterbitkan dengan akuntabilitas.
- Widget iframe tampil pada situs eksternal; API publik tidak membocorkan data pribadi.
- Sistem tetap Spark; batas kuota, permintaan read, ukuran upload dan degradasi terdokumentasi.
