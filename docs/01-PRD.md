# 01 — Product Requirements Document (PRD)

## Produk, pemangku kepentingan, dan asumsi
Nama kerja: **MTQH PINRANG DIGITAL**. Nama resmi aplikasi/domain/logo belum diputuskan. Kegiatan: MTQH XXXV Kab. Pinrang, direncanakan Januari 2027, Kecamatan Tiroang. Pengguna: sekretariat/panitia kabupaten, koordinator cabang, admin 12 kafilah, redaksi, kontributor berita, pimpinan/pengawas, masyarakat, website mitra.

## Tujuan
1. Mendata setiap peserta/regu dan status verifikasinya tanpa pendaftaran ganda yang melanggar aturan.
2. Mendukung 8 cabang referensi awal, tetapi menambah/menghapus golongan lewat konfigurasi (termasuk cabang Hadis jika resmi disetujui).
3. Input hasil **juara final, bukan skor hakim** dengan validasi, pengesahan, riwayat revisi.
4. Menampilkan klasemen 12 kecamatan otomatis menurut aturan poin/medali yang disahkan.
5. Memudahkan kontribusi berita-foto panitia, moderasi dan publikasi.
6. Menyediakan halaman publik, embed, JSON API untuk data yang boleh disebarkan.
7. Meminimalkan jumlah permintaan dan pemakaian bandwidth agar tetap pada kuota gratis.

## Fungsional rinci dan prioritas
| ID | P | Requirement | Kriteria diterima |
|---|---|---|---|
| AUTH-01 | P0 | Login email/password, logout, reset password | Session bertahan aman, status disabled dicegah masuk data |
| RBAC-01 | P0 | Peran + scope event/cabang/kecamatan | Cross-scope write/read sensitif ditolak oleh rules/backend |
| EVT-01 | P0 | Master event, 12 kecamatan, cabang, golongan | Dapat diedit saat draft, tidak mengubah arsip event lama |
| REG-01 | P0 | Peserta perorangan + regu, dokumen dan status | Kafilah hanya urus kafilah sendiri; NIK tidak wajib untuk demo |
| VER-01 | P0 | Review dan keputusan peserta | Semua transisi tercatat; tidak ada publikasi data sensitif |
| SCHED-01 | P1 | Jadwal, arena, sesi, daftar tampil | Publik hanya mendapat jadwal published |
| RESULT-01 | P0 | Input Juara I–III dan Harapan opsional | Hanya dari peserta/regu terverifikasi & nomor lomba cocok |
| RESULT-02 | P0 | Approve/reject/correction | Update idempoten, versi dan audit tersedia |
| RANK-01 | P0 | Peringkat poin & medali | Dihitung dari hasil resmi, aturan tie-break terdokumentasi |
| DASH-01 | P0 | Dashboard admin responsif dan publik | Setiap peran melihat informasi relevan |
| CMS-01 | P1 | Draft berita/foto oleh semua panitia aktif | Artikel masuk moderation queue, tidak langsung publik |
| CMS-02 | P1 | Review/edit/publish redaksi | Hanya artikel published dibaca anonim |
| PUB-01 | P0 | Portal publik dan detail hasil | Tanpa login, data cepat & jelas staleness-nya |
| API-01 | P1 | JSON `v1` dan iframe/widget | Read-only, cached, CORS, versioned, no secrets |
| MEDIA-01 | P1 | Foto Cloudinary via Worker signed | Batas ukuran, ekstensi, ownership, moderation |
| EXP-01 | P1 | CSV/XLSX/PDF | Download sesuai role, tidak bocorkan PII |
| OPS-01 | P0 | Spark guardrails dan error quota | Tanpa billing, screen fallback ketika limit terlampaui |
| A11Y-01 | P0 | Akses keyboard/kontras/responsif | WCAG 2.2 AA pada flow penting |

## Non-functional
- **Keamanan:** least privilege, audit, denial tests, no exposed API secrets; admin approval server authoritative.
- **Kinerja target desain** (bukan janji): p95 halaman publik cached <3 dtk pada jaringan baik; LCP <2,5 dtk; CLS <0,1; TBT minimal.
- **Reliabilitas:** retry idempotent, loading/error state, snapshot stale diidentifikasi, backup manual teruji.
- **Skalabilitas kuota:** ringkasan yang di-cache untuk publik, tidak membuka listener besar untuk ribuan pengunjung.
- **Lokalisasi:** Indonesia, Asia/Makassar, pengaturan tanggal kegiatan yang dapat berubah.
- **Aksesibilitas:** fokus jelas, ARIA, target sentuh min 44×44, responsif 320–1920.
- **Legalitas:** data anak dan identitas sensitif tidak diumumkan secara default; kebijakan retensi/persetujuan wajib dibahas.

## Persona/jobs-to-be-done
- Admin kafilah: "Mendaftarkan peserta dan memperbaiki berkas agar lolos verifikasi."
- Admin cabang: "Melihat peserta per golongan dan mengirim daftar pemenang yang sah."
- Panitia kabupaten: "Mengawasi progres dan mengesahkan hasil dengan jejak audit."
- Redaktur: "Mengubah kontribusi panitia menjadi berita profesional yang valid."
- Publik: "Mengetahui jadwal, juara resmi, klasemen, berita tanpa login."
- Operator videotron/website mitra: "Menampilkan data resmi melalui embed/API tanpa akses backend pribadi."

## Metode penerimaan
UAT setiap persona, security test, simulasi 12 kecamatan & ratusan peserta, simulasi hasil dan koreksi, uji gangguan internet, uji kuota, visual regression desktop-mobile. Rincian `18-TEST-QA.md`.
