# 10 — Authentication, Firestore Rules & Server Trust Boundary

## Threat assumptions
Pengguna dapat memodifikasi browser/devtools, memanggil REST SDK sendiri, menebak document IDs, mengirim payload palsu, mencoba menaikkan role, mengubah kecamatan/cabang/juara tanpa izin, mengunggah foto terlarang, membanjiri API publik.

## Autentikasi
- Firebase Auth email/password dan password reset; verifikasi email sebelum menerima role aktif bila memungkinkan.
- Undangan tanpa email provider: admin memasukkan email calon akun lalu user self-register menjadi pending; admin menambah role lewat jalur admin aman. Tidak ada auto-role dari domain email.
- Penyimpanan profil `users/{uid}` boleh edit `displayName`, preferensi non-sensitif **saja**; jangan simpan `isAdmin` yang dapat diubah sendiri.
- Akun bootstrap emulator memakai password sementara dan `mustChangePassword`; UI memblokir modul lain sampai password pribadi minimal 8 karakter dibuat. Password tidak pernah disimpan di Firestore/log.
- Profil mandiri boleh melengkapi telepon, instansi, dan fungsi kerja pada dokumen privat. Email, UID, status, dan role tidak dapat diubah client.
- Disable/revoke user memerlukan pengecekan assignment/status saat setiap operasi sensitif, bukan hanya saat login.
- Firebase client config (`apiKey`, `projectId`) boleh dipublikasi sesuai model Firebase; rahasia server (`FIREBASE_PRIVATE_KEY`, Cloudinary secret) tidak boleh.

## Firestore Rules baseline
- Default deny semua resource.
- Public `read` hanya pada koleksi `publicEvents/{id}/...` yang berisi data sanitized.
- `users/{uid}`: pengguna boleh baca data sendiri; update hanya field preferensi/display non-privileged dengan `diff().affectedKeys().hasOnly(...)`.
- `roleAssignments/{uid}`: pengguna boleh `get` assignment miliknya; **semua write via Worker privileged** (rules deny).
- Data pendaftaran: hanya kafilah sesuai scope dan verifier/admin; field PII dibatasi, bedakan dokumen publik privat.
- Result draft: hanya branch admin assigned + status submitted; approved results **no direct client writes**.
- Admin approval & snapshot publish: hanya Worker setelah verifikasi token dan role server-side, memakai service credential.
- News draft: author submit hanya miliknya; publish via Worker/editor approval atau rule ketat; public representation dibuat hanya setelah approval.
- Dokumentasi audit append-only oleh Worker, tidak bisa diedit client.
- Query rules are not filters: query harus tepat sama dengan predicate permission agar tidak `permission-denied`.
- Security rules `get()`/`exists()` pada role mengonsumsi reads; hitung efek kuota.

## Contoh rule KONSEPTUAL, bukan siap deploy
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    match /publicEvents/{eventId}/snapshots/{snapshotId} {
      allow read: if true;
      allow write: if false; // Worker IAM bypass rules, must enforce policy server-side
    }
    match /roleAssignments/{uid} {
      allow get: if request.auth != null && request.auth.uid == uid;
      allow list, create, update, delete: if false;
    }
  }
}
```
**Perhatian**: rule default deny di contoh hanya mengilustrasikan basis; developer harus menulis aturan per koleksi dan mengetes serta memeriksa precedence/OR rule matches. Dokumentasi Firestore menyatakan server clients/REST dengan IAM dapat bypass Security Rules — Worker **wajib** melakukan authorization aplikasi sendiri.

## Worker auth architecture
1. Frontend mengirim `Authorization: Bearer <Firebase ID token>` untuk operasi privileged.
2. Worker verifikasi signature token dengan Google public keys/JWKS, `alg=RS256`, `aud=projectId`, `iss=https://securetoken.google.com/{projectId}`, `exp`, `iat`, `sub` dan status akun/role sesuai kebutuhan. Jangan hanya decode tanpa verify.
3. Worker membaca role assignment dari Firestore via service account IAM (secret di Worker), memvalidasi `eventId`, assigned scope dan status.
4. Worker memvalidasi payload Zod/JSON Schema, idempotency, status transition, cross-document references, lalu menulis via REST/transaction.
5. Untuk approve hasil, Worker harus memproses satu event/version konsisten dan menerbitkan publikasi/snapshot lewat jalur atomik atau pointer versioning; catat audit.
6. Worker membatasi ukuran body, origin untuk browser UI, rate-limit dasar, CORS allowlist; CORS **bukan** mekanisme autentikasi.
7. **CPU 10ms Free** perlu dibuktikan lewat profil; jika CPU berat, kurangi kerja per request/pecah batch, jangan diam-diam mengubah plan.

## Proteksi lanjut
- CSRF tidak relevan untuk bearer header tanpa cookie auth secara default; tetap audit CORS dan XSS.
- Sanitize HTML artikel dengan allowlist sebelum render; CSP ketat; larang `dangerouslySetInnerHTML` tanpa sanitasi.
- Log jangan berisi token, nomor identitas, alamat privat, EXIF GPS atau password.
- Media signed upload: cek file type/magic bytes sisi browser sebelum Worker request, tetapi *server* juga validasi metadata/cloud response; trusted public media only.
- Backup terenkripsi, akses terbatas, retensi disetujui panitia.
- Uji role manipulation, scope switch, IDOR, replay, duplicate POST, data leak, stale token, brute force.
