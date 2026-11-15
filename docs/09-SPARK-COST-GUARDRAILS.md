# 09 — Firebase Spark Guardrails, Budget Nol dan Mode Degradasi

**Keputusan mutlak:** Firebase project tetap **Spark**, tidak boleh meminta pengguna upgrade ke Blaze. Dokumen diperiksa terhadap sumber resmi pada **15 November 2026**. Angka harus dicek ulang saat deployment.

## Daftar layanan
| Layanan | Pilihan | Catatan |
|---|---|---|
| Firebase Auth | Email/password | Gratis untuk pola dasar; hindari SMS/phone auth |
| Cloud Firestore Standard | Ya | 1 GiB data, 50k reads/hari, 20k writes/hari, 20k deletes/hari, 10 GiB egress/bulan pada kuota gratis |
| Firebase Hosting klasik | Ya | 10 GB storage dan 10 GB/bulan transfer gratis menurut dokumen Hosting 12 Nov 2026; tetap verifikasi konsol |
| Cloud Storage for Firebase | **Tidak** | Sejak 3 Feb 2026 akses bucket memerlukan Blaze (error 402/403 di Spark) |
| Cloud Functions / Google Cloud Run / App Hosting | **Tidak** | Tidak memenuhi syarat Spark-only dalam spesifikasi ini |
| Backup terkelola / PITR / TTL deletes Firestore | **Tidak** | Tidak termasuk kuota gratis; ekspor manual aman |
| OTP via SMS | **Tidak** | Berpotensi billing |
| Cloudinary Free | Eksternal | 25 kredit/bln untuk total konsumsi storage, transformasi, bandwidth; bukan unlimited |
| Cloudflare Workers Free | Eksternal | 100k request/hari, CPU limit 10ms/permintaan, subrequests 50/request; pantau ketercapaian |

## Audit dependency pada setiap PR
- Review `package.json`, `firebase.json`, `wrangler.toml`, CI dan kode backend.
- Larang package yang otomatis provisioning Cloud Run/App Hosting/Cloud Functions tanpa explicit approval.
- Larang `firebase deploy --only functions`; gunakan `firebase deploy --only hosting,firestore` bila rules/indexes disiapkan.
- Jangan mengaktifkan Cloud Billing; jangan menambahkan kartu kredit pada project Firebase untuk memenuhi kebutuhan aplikasi.
- Jangan menyimpan foto di Firestore (Base64) dan Firebase Storage.
- Jangan menggunakan Gemini API/Firebase AI Logic default; bila ingin AI copywriting kelak, harus desain offline/manual tanpa biaya tersembunyi.

## Kapasitas dan proyeksi contoh
Asumsi 12 kafilah, ~500–1000 peserta (hipotesis kapasitas, bukan data resmi), 50–80 nomor lomba, ≤100 panitia, 1000 pembaca portal/hari. Contoh kasar:
- 1.000 pembaca × 3 halaman × 6 reads = **18.000 reads/hari** sebelum tambahan rules/listener (terlalu tinggi untuk pemborosan); target publik: snapshot cached via Worker, maksimal 1–2 reads Firestore per cache miss, **bukan per pembaca**.
- 60 nomor lomba × 3 perubahan hasil = 180–500 writes ditambah audit dan snapshot; masih harus perhitungkan aktivitas media/pendaftaran.
- 300 foto × 0,35 MB ≈ 105 MB penyimpanan; bandwidth thumbnails dan transformasi bisa menjadi bottleneck terpisah.
- Perhitungan kuota harus dibuat dari pengukuran staging, bukan hanya asumsi ini.

## Strategi kuota
- `getDoc` untuk konfigurasi kecil; `onSnapshot` hanya pada halaman admin yang membutuhkan live. Unsubscribe saat halaman tak aktif.
- Publik **tidak** attach listener semua hasil; Worker menyajikan snapshot publik dengan cache TTL 30–60 detik (+ stale-while-revalidate bila aman).
- Hindari N+1 query; paginate maksimal 20–50 items per page; indeks tepat, denormalisasi data publik sesuai kebutuhan.
- Penyimpanan foto Cloudinary dengan client compression; thumbnails lazy-loading dan responsif; hindari video hosting langsung.
- Gunakan browser Cache API/PWA untuk asset statis, jangan cache PII sensitif di service worker.
- Buat tampilan observability kuota manual: jumlah read/write yang DIINSTRUMENTASI sebagai estimasi; **bukan mengaku angka billing Firebase resmi tanpa API**.

## Fail-safe (tanpa upgrade)
- 70% estimasi batas: warning dashboard internal; kurangi refresh, nonaktifkan export massal otomatis.
- 85%: force cache panjang untuk publik, tunda unggah media non-kritis, prioritaskan pendaftaran/hasil.
- 95%: matikan realtime publik/unggah foto sementara; tampilkan snapshot terakhir dan waktu pembaruan.
- Quota exhausted: tampilkan layar degraded + jalur kerja offline manual terkontrol, bukan pesan upgrade.
- Setiap threshold adalah *kebijakan internal berbasis observasi*, bukan otomatis deteksi akurat kuota bila telemetry provider tidak tersedia.

## Checklist sebelum deploy
- Firebase console menampilkan `Spark`; screenshot untuk catatan operasional.
- Service billing tidak terhubung; tidak ada Cloud Functions/Storage/App Hosting dalam repo.
- Firebase Rules diuji; auth email/password aktif.
- Worker Free dan Cloudinary Free diverifikasi quota dan secret.
- Hosting transfer dan Firestore reads diuji saat simulasi view traffic.
- Backup/export & rollback diuji.

## Rujukan
Lihat `docs/28-SOURCES.md` untuk URL resmi dan tanggal verifikasi. Bila pricing page berbeda dari dokumen Hosting, gunakan angka konservatif, pantau konsol aktif dan lakukan review sebelum go-live.
