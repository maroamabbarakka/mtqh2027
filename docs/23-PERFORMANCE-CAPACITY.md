# 23 — Sizing, Firestore Read Budget, CPU dan Kapasitas

## Baseline simulasi (angka hipotetis)
| Asumsi | Nilai demo | Risiko |
|---|---:|---|
| Kafilah | 12 | Tetap master resmi |
| Peserta | 800 | Jumlah dapat berubah |
| Kategori lomba | 48 | Tidak resmi; harus konfigurabel |
| Panitia akun | 80 | Auth cost/role review |
| Kiriman berita | 150 | 5 foto tiap berita => 750 foto |
| Pengunjung publik/hari | 3.000 | Spike hari final |
| Permintaan halaman/pengunjung | 3 | 9.000 page views/hari |

## Mengapa API cached penting
Jika 9.000 page views × 8 Firestore reads langsung = 72.000 reads/hari **di atas** kuota gratis 50.000, bahkan sebelum admin. Dengan Worker cache per endpoint dan satu dokumen snapshot per cache miss, read dapat sangat berkurang (bergantung cache hit ratio dan cache key). Jangan mengklaim angka pasti tanpa pengukuran.

## Target data shape
- Public standings: 12 rows × <300 bytes + metadata => hanya beberapa KB.
- Public summary: 1 small doc <20 KB, tidak ada detail personal.
- News list: pagination 12 item, cover thumbnail URL.
- Internal registration listing: 25 rows per query, filter scope; tidak fetch seluruh peserta setiap render.
- Media thumbs: adaptif 320/640/1024 WebP/AVIF bila transform sesuai plan; lazy load.

## Simulasi traffic dan acceptance
- Test 1: 50 user admin secara serentak membuka dashboard ringkas dan 12 admin cabang input hasil.
- Test 2: 1000 request/s pada public API via staging **dengan traffic uji terkendali** tanpa membebani provider produksi; perhatikan Workers 100k req/hari.
- Test 3: jalankan 30 perubahan hasil, pantau jumlah writes dan snapshots yang diterbitkan.
- Test 4: 100 upload foto compress; hitung ukuran rata-rata, waktu transfer, bandwidth.
- Test 5: CPU Worker approval/sign di bawah batas Free 10ms dengan margin; jika gagal, redesign.

## Observability minimal
- Browser Web Vitals (secara lokal atau agregat tanpa PII) untuk LCP, CLS, INP.
- Estimasi Firestore operation counts per route, trace event yang dibatasi.
- Cloudflare dashboard request/CPU + Cloudinary credit usage + Firebase console usage (manual review harian).
- Alert internal sederhana berbasis angka yang dimasukkan/diambil legal; jangan menyatakan monitoring quota real-time jika tidak tersedia.

## Fallback
- Cache last good public snapshot dengan cap waktu.
- Halaman `/status` yang menjelaskan ketersediaan sementara, tanpa janji data live.
- Prioritas bandwidth: hasil resmi + jadwal > berita teks > media thumbnail > foto besar.
