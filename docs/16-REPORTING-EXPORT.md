# 16 — Laporan, Impor/Ekspor, Arsip, Backup

## Laporan admin
- Daftar peserta per kecamatan, cabang, golongan, gender, status verifikasi.
- Regu beserta anggota (role-terbatas).
- Jadwal per cabang, venue, tanggal.
- Rekap pengajuan hasil, siapa input, status pengesahan, histori koreksi.
- Hasil juara dan klasemen final menurut policy aktif.
- Berita per penulis/kontributor, tanggal, kategori, moderasi.
- Log audit dan perubahan peran (hanya super admin).

## Format
CSV (UTF-8 BOM untuk Excel Indonesia), XLSX (`ExcelJS` atau library setara yang teruji lisensinya), PDF lokal browser (jsPDF atau React PDF sesuai kebutuhan). Semua export harus mencantumkan timestamp WITA, filter, sumber, event, status pengesahan, serta jenis `DRAFT/RESMI`.

## Prinsip keamanan
- Jangan ekspor tanggal lahir, nomor ID, kontak, atau identitas minor ke laporan publik.
- Ekspor role-limited (kafilah hanya kafilah sendiri) diverifikasi query/rules; file tidak dikirim via URL publik.
- PDF berita acara hanya dibuat jika format/penandatangan sah sudah ditentukan; jangan membuat tanda tangan/stempel pejabat.
- Ekspor hasil resmi menyertakan versi pengesahan dan catatan koreksi.

## Backup Spark-only
Firestore backup terkelola dan PITR memerlukan billing, sehingga **tidak tersedia**. Sediakan menu admin untuk ekspor koleksi yang diizinkan dalam file JSON terstruktur, dan protokol backup **manual terjadwal** menggunakan perangkat aman/penyimpanan offline terenkripsi. Jangan meletakkan backup PII di Cloudinary atau Firebase Hosting publik.

## Restore
1. Simulasikan restore pada emulator atau proyek uji Spark terpisah, **bukan pada produksi**.
2. Validasi schemaVersion, eventId, referential integrity, checksum dan statistik jumlah dokumen.
3. Operasi restore produksi hanya oleh super admin berwenang dengan prosedur dual control dan maintenance window.
4. Audit waktu backup, siapa yang menyalin, lokasi aman dan retention policy.

## Ekspor publik
Dataset read-only CSV/JSON: klasemen 12 kecamatan, award list official, jadwal yang dipublikasikan, statistik agregat, berita published. `updatedAt` wajib disertakan.
