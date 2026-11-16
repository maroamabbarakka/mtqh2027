# Changelog

## 0.10.0 — 16 November 2026

### Ditambahkan

- Konfigurasi maksimal enam slot penghargaan draft per golongan dengan ID teknis stabil dan label yang dapat dikoreksi.
- Editor Master Data, parser/formatter, audit atomik, Rules role-admin, unit test, Rules test, dan E2E responsif.

### Keamanan produk

- Slot baru selalu `draft`, tidak mengaktifkan hasil resmi, bobot poin, maupun klasemen.
- Admin kafilah dan role non-admin ditolak mengubah konfigurasi slot.

## 0.9.0 — 16 November 2026

### Ditambahkan

- Kontrak dan schema strict pengajuan hasil lomba dengan slot penghargaan dinamis tanpa skor.
- Validasi pemenang unik, slot unik, metadata berita acara, tanggal penetapan, dan batas enam penghargaan.
- Lima unit test keamanan payload hasil.

### Keamanan produk

- Field asing seperti `score` atau `nilai` ditolak.
- UI hasil tetap feature-off sampai slot penghargaan dikonfigurasi dan disahkan; aplikasi tidak mengarang Juara I/II/III.

## 0.8.0 — 16 November 2026

### Ditambahkan

- Ekspor CSV registrasi privat berdasarkan role, scope query, pencarian, dan filter status aktif.
- Metadata event, scope, filter, jumlah data, serta timestamp WITA dalam file berlabel `DRAFT INTERNAL`.
- Pengamanan formula injection, UTF-8 BOM, dan tiga unit test generator CSV.

### Keamanan dan kuota

- Ekspor tidak memuat kontak, catatan privat, actor UID, audit, NIK, atau tanggal lahir.
- File dibuat dari maksimal 50 entri yang sudah dimuat sehingga tidak menambah operasi Firestore.

## 0.7.0 — 16 November 2026

### Ditambahkan

- Endpoint Worker verifikasi final registrasi dengan Firebase JWT dan otorisasi role server-trusted.
- Firestore REST service-account OAuth, commit status+audit atomik, precondition versi dokumen, dan replay idempoten.
- Tiga belas pengujian Worker termasuk separation of duties, reviewer ownership, role negatif, status ilegal, CORS, dan boundary HTTP.

### Keamanan

- Credential service account hanya dibaca dari Worker secret dan tidak masuk frontend atau repository.
- UI verifikasi final tetap nonaktif sampai IAM minimum, staging, pengukuran CPU, dan deployment Worker disetujui.

## 0.6.0 — 16 November 2026

### Ditambahkan

- Pengajuan draft, pengambilan pemeriksaan, permintaan revisi, dan penolakan administratif.
- Filter status serta modal alasan keputusan untuk reviewer.
- Audit atomik dan metadata submit/review dengan timestamp server serta idempotency key.
- Rules dan E2E dua akun untuk separation of duties.

### Keamanan

- Pembuat entri tidak dapat memeriksa entri sendiri.
- Hanya reviewer yang mengambil antrean dapat memberi keputusan lanjutan.
- Status `verified` tetap ditolak dari client sampai Worker tepercaya tersedia.

## 0.4.0 — 16 November 2026

### Ditambahkan

- Halaman Master Data untuk event, 12 kecamatan Kabupaten Pinrang, cabang, dan golongan.
- Seed emulator deterministik berisi 12 kecamatan resmi, delapan cabang referensi draft, dan tiga golongan contoh berlabel belum disahkan.
- CRUD terbatas create/read/update untuk cabang dan golongan draft; ID teknis immutable dan penghapusan fisik ditolak.
- Write batch atomik antara perubahan master dan `eventAudit`, lengkap dengan idempotency key serta revision counter.
- Schema Zod, tiga unit tests, tiga rules integration tests, dan Playwright E2E desktop/mobile untuk REG-101.

### Keamanan

- Hanya `super_admin` dan `event_admin` yang dapat menulis master data draft.
- Client tidak dapat mengaktifkan, mengesahkan, menghapus master data, atau mengubah audit lama.
- Golongan dengan referensi cabang yang tidak tersedia ditolak oleh Firestore Rules.

## 0.3.0 — 15 November 2026

### Ditambahkan

- Delapan akun emulator yang mewakili seluruh fungsi RBAC dengan password sementara dan kewajiban mengganti password setelah login pertama.
- Halaman profil dan keamanan responsif untuk melengkapi identitas kerja, mengganti password, melihat penugasan, serta membaca aktivitas akun.
- Log aktivitas akun append-only dengan action allowlist; audit sensitif server-side tetap dipisahkan.
- Tiga rules integration tests tambahan dan dua Playwright E2E untuk first-login, profil, password, dashboard, dan viewport 390 px.

### Keamanan

- User tidak dapat mengubah UID, email, status, role, atau log lama miliknya.
- Password sementara hanya untuk emulator lokal; tidak ada akun produksi atau deployment yang dibuat.

## 0.2.0 — 15 November 2026

### Ditambahkan

- Firebase Auth Email/Password bootstrap, login, lupa kata sandi, akun pending/disabled, sign-out, dan protected routes.
- RBAC frontend dengan permission map serta navigasi sesuai izin aktif.
- Firestore Rules event-scoped untuk profil, role assignment, peserta, registrasi, pengajuan hasil, berita, official results, dan proyeksi publik.
- Enam emulator rules tests untuk IDOR lintas kecamatan/cabang, self-escalation, contributor publish, akun disabled, dan akses publik.
- Seed emulator idempoten untuk dua admin kafilah, admin cabang, dan editor.
- Cloudflare Worker Free skeleton dengan JWKS Firebase token verification, origin allowlist, Zod envelope, idempotency key, serta respons aman.
- Runner rules test yang menyaring environment sensitif dari proses emulator/CI.
- Route autentikasi, area admin, Firebase Auth provider, dan grafik dipisahkan menjadi lazy chunks agar portal publik tidak memuat dependensi privat di awal.

### Keamanan

- Tidak ada public super-admin bootstrap, direct client write ke role, direct client write ke official results, service-account key, atau Cloud Storage SDK.
- Worker skeleton belum melakukan operasi tulis sampai verifikasi role server-side dan transaksi endpoint per modul selesai.

## 0.1.0 — 15 November 2026

### Ditambahkan

- Fondasi monorepo React 19, Vite, TypeScript strict, Tailwind CSS, TanStack Query, React Router, Recharts, dan Vitest.
- Portal publik responsif dengan hero acara, navigasi, jadwal/hasil/berita bertahap, klasemen simulasi, dan status keputusan terbuka.
- Dashboard panitia dengan sidebar adaptif, KPI aman, grafik berlabel simulasi, progres persiapan, status Spark, serta placeholder modul.
- Integrasi tiga aset visual paket: logo MTQH, lambang LPTQ, dan lambang Kabupaten Pinrang dengan label verifikasi aset.
- Konfigurasi Firebase Hosting klasik untuk SPA dan Firestore Rules default-deny.
- Launcher Vite/Vitest aman untuk workspace Windows yang mengandung karakter `#`.
- Screenshot visual fase 01 pada desktop dan mobile.
- Bootstrap Firebase App tervalidasi melalui environment untuk proyek `mtqhpinrang2027`, tanpa mengaktifkan SDK Storage.

### Keamanan dan kuota

- Tidak ada Cloud Functions, Cloud Storage, App Hosting, SMS OTP, service account, atau secret frontend.
- Belum ada koneksi Firestore produksi; semua angka UI diberi label simulasi atau belum tersedia.
- Operasi pengesahan, role, dan media belum diaktifkan pada fase ini.
