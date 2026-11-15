# Template `.env.example` dan Secret Setup (JANGAN isi secret di Git)

## Vite frontend — public-only config
```dotenv
VITE_FIREBASE_API_KEY=YOUR_PUBLIC_FIREBASE_KEY
VITE_FIREBASE_AUTH_DOMAIN=PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=PROJECT_ID
VITE_FIREBASE_APP_ID=YOUR_PUBLIC_APP_ID
VITE_PUBLIC_EVENT_ID=mtqh-pinrang-2027
VITE_WORKER_BASE_URL=https://YOUR_WORKER.workers.dev
VITE_ENVIRONMENT=local
```
**Catatan**: Firebase web API key pada config client bukan private service account secret. Pembatasan akses tetap dari Auth/Rules.

## Worker — Wrangler secrets, bukan `.env` frontend
```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
ALLOWED_ORIGIN
```
- Gunakan `wrangler secret put <NAME>`; gunakan local `.dev.vars` dan masukkan ke `.gitignore`.
- Service-account Firebase/GCP berbahaya jika bocor; buat prinsip IAM least privilege dan rotasi.
- Jangan menyimpan account secrets pada screenshot, komentar atau dokumen laporan.

## Command contoh (sesuaikan package.json)
```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
firebase emulators:start --only auth,firestore
firebase deploy --only hosting,firestore:rules,firestore:indexes
```
**Kritis**: cek bahwa project masih Spark dan CLI tidak mengaktifkan layanan terlarang sebelum deployment.
