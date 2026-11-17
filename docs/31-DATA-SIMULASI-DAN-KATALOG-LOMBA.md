# Data Simulasi dan Katalog Lomba

## Status data

Seluruh cabang, golongan, jadwal, peserta/regu, dan hasil yang dibuat oleh `npm run seed:emulator` adalah **data simulasi lokal**. Data ini bukan keputusan resmi MTQH XXXV Kabupaten Pinrang 2027, tidak dikirim ke proyek produksi, dan seluruh konfigurasi golongan tetap berstatus draf sampai juknis panitia disahkan.

## Dasar katalog

Katalog simulasi merangkum cabang yang lazim ditemukan pada penyelenggaraan MTQ: Tilawah/Tartil, Qiraat, Tahfiz, Tafsir, Fahmil, Syarhil, Kaligrafi, dan Karya Tulis Ilmiah Al-Qur'an. Variasi putra/putri dan golongan diambil sebagai bahan pengujian antarmuka dari rujukan berikut:

- Bimas Islam Kementerian Agama, sejarah dan cabang MTQ: https://simbi.kemenag.go.id/artikel/sejarah-mtq-dari-gerakan-masyarakat-menjadi-tradisi-nasional
- Bimas Islam Kementerian Agama, pemasyarakatan Al-Qur'an melalui MTQ: https://bimasislam.kemenag.go.id/artikel/upaya-memasyarakatkan-al-quran-melalui-mtq
- Kementerian Agama Kota Yogyakarta, rincian cabang dan golongan: https://yogyakartakota.kemenag.go.id/mtq-tingkat-kota-yogyakarta-wujudkan-generasi-melinial-yang-qurani/
- Kementerian Agama Sulawesi Tengah, cabang MTQ XXXI: https://sulteng.kemenag.go.id/berita/xx3g/08-06-2026-mtq-xxxi-sulteng-resmi-dibuka-di-sigi-bangun-generasi-cinta-qurani-dan-harmoni-keberagaman

Katalog ini sengaja tidak mengaktifkan cabang Hadis karena kepastiannya untuk Pinrang 2027 masih menunggu keputusan resmi. Batas usia, kuota, persyaratan, lokasi, tanggal, dan slot penghargaan juga belum boleh dianggap resmi.

## Isi simulasi

- 12 kecamatan Kabupaten Pinrang.
- 8 cabang dan 46 golongan draf.
- Tiga pendaftaran terverifikasi untuk setiap golongan, tersebar bergilir ke seluruh kecamatan.
- Data peserta individu dan regu dengan nama generik, tanpa NIK, tanggal lahir, atau identitas nyata.
- Satu jadwal draf dan satu pengajuan hasil draf untuk setiap golongan.
- Hasil hanya menyimpan urutan penghargaan berdasarkan berita acara simulasi; tidak ada skor, komponen nilai, atau e-scoring.

## Menyiapkan data

1. Jalankan emulator: `npm run emulators`.
2. Di terminal lain jalankan: `npm run seed:emulator`.
3. Masuk menggunakan akun simulasi pada dokumentasi akun. Kata sandi awal seluruh akun adalah `123456`.

Perintah seed selalu membersihkan koleksi simulasi yang dikelolanya sebelum menulis ulang, sehingga hasilnya konsisten dan tidak menumpuk.

## Menghapus data simulasi

Saat pengujian selesai, jalankan `npm run reset:emulator-demo` ketika emulator masih aktif. Perintah ini hanya menunjuk proyek emulator tetap `mtqh-pinrang-2027-demo` pada `127.0.0.1`; tidak menerima nama proyek produksi dan tidak dapat menghapus data Firebase produksi.
