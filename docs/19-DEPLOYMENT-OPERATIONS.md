# 19 — Deployment, Konfigurasi, Operasional dan Pemulihan

## Lingkungan
`local` = Firebase Emulator + mock Cloudinary; `staging` = proyek pengujian Spark bila tersedia; `production` = proyek Spark resmi, Firestore Standard, Firebase Hosting klasik; Worker Cloudflare Free dan Cloudinary Free terpisah. Jangan deploy dengan data nyata ke staging publik.

## Setup Firebase Spark
1. Buat project baru di Firebase Console, periksa label **Spark**; jangan hubungkan billing account.
2. Register Web app; copy public Firebase config ke `.env.local` (field ini bukan service account secret).
3. Aktifkan Auth Email/Password (dan password recovery bila tersedia).
4. Buat Firestore Standard (pilih region paling sesuai) dengan rules default-deny dulu.
5. Setup Firebase Hosting classic; hindari setup wizard App Hosting.
6. Jalankan emulator dan tests rules sebelum deploy.
7. Deploy `hosting`, `firestore:rules`, `firestore:indexes` saja, dengan tahap dan review eksplisit.

## Setup Cloudinary
1. Daftar Cloudinary Free, konfirmasi 25 kredit per bulan dan termnya.
2. Buat signed upload preset terbatas; tidak ada unsigned public upload produksi.
3. Simpan `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` ke Cloudflare secrets (secret tidak pernah masuk Vite).
4. Tetapkan transform yang hemat kredit, ukuran dan jenis foto yang diizinkan.
5. Uji sign/register/reject dan foto lintas-role.

## Setup Cloudflare Worker
1. Buat Worker Free, install Wrangler; pastikan tidak mengaktifkan plan berbayar.
2. Secrets: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`; konfigurasi CORS origin.
3. Service account IAM hanya permission yang diperlukan; pertimbangkan penggunaan cred rahasia dan prosedur rotasi.
4. Deploy Worker dan tes GET API publik cached, POST sign auth, approve, publish.
5. Monitor CPU Worker (limit Free 10ms), request limit; bila gagal jangan minta upgrade, optimasi/reduce scope.

## Contoh config Firebase Hosting klasik
```json
{
  "hosting": {
    "public": "apps/web/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [
      {"source": "/assets/**", "headers": [{"key": "Cache-Control", "value": "public,max-age=31536000,immutable"}]},
      {"source": "/index.html", "headers": [{"key": "Cache-Control", "value": "no-cache"}]}
    ]
  }
}
```
Sesuaikan lokasi `public` jika monorepo build output berubah. Konfigurasi CSP khusus halaman embed/admin perlu diuji karena SPA rewrite dan header path matching.

## Secrets dan backup
- `.env.local`, `.dev.vars`, service account JSON dan Worker secrets tidak boleh di-commit.
- `VITE_FIREBASE_*` / public Firebase config boleh di frontend; jangan keliru menyebut semua config Firebase sebagai secret.
- Simpan recovery codes, admin credentials dan backup terenkripsi di media aman panitia.
- Jadwalkan ekspor laporan dan backup terkontrol minimal harian saat event. Restore diuji **di staging**.

## Runbook darurat
1. **Firebase read quota mendekati batas** -> tingkatkan cache publik, hentikan polling masif, gunakan snapshot terakhir.
2. **Cloudinary kredit menipis** -> jeda unggah foto, tetap izinkan teks berita, jangan hapus media sembarangan.
3. **Worker outage** -> input draft boleh dilanjut jika Firestore aman; pengesahan/publish dinonaktifkan sampai pulih; tampilkan status offline.
4. **Hasil salah publish** -> super admin buka proses koreksi; histori retained, recompute snapshot baru, tampilkan correction notice.
5. **Akun dicurigai** -> disable Auth dan revoke role, rotasi token/secrets, audit perubahan terakhir.
6. **Situs publik terhambat kuota** -> halaman HTML fallback jika tersedia, komunikasikan waktu data terakhir; tidak beralih Blaze.

## Go-live
Ikuti `docs/29-RELEASE-CHECKLIST.md`; persetujuan panitia berwenang diperlukan untuk tanggal, logo, daftar cabang dan aturan poin. Developer tidak boleh mengasumsikan itu final.
