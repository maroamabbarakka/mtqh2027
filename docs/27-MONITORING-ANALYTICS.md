# 27 — Observability, Audit, Event Analytics Tanpa Layanan Berbayar

## Telemetry yang boleh
- `page_view` agregat (opsional, tanpa identitas langsung), `login_success` internal, `registration_submitted`, `verification_done`, `result_submitted`, `result_approved`, `result_corrected`, `article_submitted`, `article_published`, `media_upload_failed`, `snapshot_published`.
- Audit bisnis wajib server-side: who/when/what, previousVersion/newVersion, reason, request id; tidak menulis PII penuh ke audit.
- Performance: LCP/CLS/INP hasil pengujian browser; CPU Worker, hit cache ratio, Firebase console usage.

## Data dashboard eksekutif
- Kafilah aktif, peserta draft/submitted/verified, nomor lomba in progress/official, total official awards, jumlah berita submitted/published, jumlah foto dimoderasi.
- Tampilkan metodologi `jumlah peserta` (orang unik vs entri lomba) agar tidak terjadi double count.
- Grafik per cabang, gender agregat, progres verifikasi, berita per hari, hasil resmi per waktu.

## Catatan biaya dan privasi
- Hindari event analytics setiap scroll/click; logging yang terlalu rinci menghasilkan writes Firestore dan membuang quota.
- Untuk MVP: statistik bisnis derived dari koleksi, pembacaan admin dibatasi, log diagnostik offline/file bila tepat.
- Jangan memuat data kesehatan, NIK, password, alamat privat, token ke analytics.
- Metrik usage harian yang ditampilkan internal sebagai estimasi harus diberi label estimasi, bukan billing meter resmi.
