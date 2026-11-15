# 26 — Operational Runbook Saat MTQH Berlangsung

## Sebelum acara (H-7 s.d H-1)
- Konfirmasi akun semua admin kafilah/cabang; reset password awal dan role aktif sesuai jadwal.
- Validasi data 12 kecamatan, cabang/golongan final, kuota, policy poin sudah berstatus approved; cetak checklist panitia.
- Verifikasi nama event, lokasi, nomor panitia, logo, jadwal yang published.
- Backup terenkripsi dan test restore pada emulator; catat operator penanggung jawab.
- Test 10 hasil dummy di staging -> approve -> koreksi -> dashboard publik -> API -> videotron.
- Pastikan project Spark; periksa konsumsi Firestore/Hosting, Cloudinary kredit, Worker request/CPU.

## Selama lomba — checklist shift
- `Admin Cabang`: cek akun/cabang; input juara setelah keputusan resmi; unggah berita acara bila jenis dokumen dan storage aman disetujui; submit.
- `Admin Kabupaten`: periksa output dari dokumen hasil sumber; approve; verifikasi klasemen; koreksi jika perlu.
- `Redaksi`: review berita/foto, verifikasi fakta dan persetujuan publikasi, publish.
- `Operator Videotron`: cek timestamp last updated, berganti scene sesuai jadwal; saat down gunakan snapshot fallback dengan label pembaruan.
- `Sysadmin`: pantau kuota; log error; backup rutin; batasi polling.

## Protokol insiden
| Level | Contoh | Tindakan |
|---|---|---|
| SEV1 | Dugaan kebocoran PII/hasil resmi palsu | Hentikan akses terkait, revoke roles, audit, pemulihan, lapor pemilik data |
| SEV2 | Approval gagal atau klasemen salah | Stop approval/publish, freeze snapshot, recompute & verifikasi |
| SEV3 | Cloudinary gagal upload, artikel tertunda | Tampilkan status, teruskan berita teks, retry setelah sehat |
| SEV4 | Layout minor di mobile | Masuk backlog, tidak menghambat input hasil |

## Post-event
- Freeze hasil official dan policy juara umum; ekspor laporan final.
- Ambil snapshot final dan checksum; arsip berita dan galeri yang telah diizinkan.
- Cabut role sementara, rotasi secret jika perlu, dokumentasikan akses admin.
- Review kuota/biaya (target nol) dan catat rekomendasi event berikutnya.
- Tentukan retensi PII dan media sesuai kebijakan panitia.
