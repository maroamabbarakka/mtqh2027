# 30 — Implementation Log

## Fase 15 — Koreksi Kontras dan Occlusion Logo Hero (16 November 2026)

- Logo hero desktop ditempatkan pada bidang ivory berkontras tinggi dengan border emas halus; seluruh detail hijau, teks kecil, dan identitas tahun dapat terbaca tanpa mengubah berkas logo sumber.
- Rasio logo dipertahankan memakai `object-fit: contain`; tidak ada crop, masking, atau regenerasi identitas.
- Badge “Informasi terverifikasi” dipindahkan dari overlay absolut menjadi elemen mandiri di bawah bidang logo sehingga tidak lagi menutupi nama maupun bagian bawah logo.
- Efek halo dan bayangan dipertahankan pada intensitas rendah untuk memisahkan bidang logo dari hero teal tanpa membuatnya terlihat seperti tempelan kasar.
- Pada mobile, bidang ivory dinonaktifkan dan logo tetap menjadi watermark dekoratif beropasitas rendah agar ruang baca serta CTA tidak terganggu.
- Screenshot desktop 1440×900 dan mobile 390×844 lulus tanpa horizontal overflow.

## Fase 14 — Audit dan Refinement UI/UX (16 November 2026)

### Perbaikan visual

- Shell admin dipoles dengan topbar sticky berlapis blur, motif geometris halus pada sidebar, elevasi kartu konsisten, focus ring aksesibel, dan ritme grid yang lebih dekat dengan mockup premium civic-Islamic.
- Dashboard menampilkan nama akun aktif, KPI dengan hierarchy yang lebih kuat, serta layout desktop 2/3–1/3 dan mobile dua kolom tanpa overflow horizontal.
- Portal publik diperbaiki pada lebar mobile: menu tetap terlihat, strip informasi tidak memaksa lebar halaman, hero/CTA membungkus aman, dan bottom navigation menghormati safe-area perangkat.
- Tabel lebar mempunyai scrollbar lokal serta petunjuk geser di mobile; hover, active, focus, dan reduced-motion tetap terjaga.

### Validasi dan keputusan aset

- Screenshot aktual diambil pada 1440×900 dan 390×844 untuk dashboard serta portal publik; seluruh viewport menghasilkan `scrollWidth === clientWidth`.
- Tiga logo WebP lokal tetap digunakan sesuai fungsi identitasnya. Aset generatif baru tidak dibuat karena tidak diperlukan dan berisiko menambah identitas/ilustrasi yang belum disahkan panitia.
- Mockup diterjemahkan sebagai arah estetika; data, lokasi, foto, menu penilaian, dan angka generatif pada mockup tidak disalin.

## Operasional — Bootstrap Worker Produksi (16 November 2026)

- Worker `mtqh-pinrang-api` dibuat pada akun Cloudflare terotorisasi dan health endpoint berhasil diverifikasi.
- URL aktif: `https://mtqh-pinrang-api.lpplradiosbl.workers.dev`.
- CORS mengizinkan origin development serta Firebase Hosting resmi; preflight produksi menghasilkan `204` dengan origin tepat.
- CSP Firebase Hosting mengizinkan koneksi hanya ke URL Worker tersebut dan endpoint Firebase/Google yang diperlukan.
- Service account khusus memperoleh IAM `Cloud Datastore User` pada proyek target; OAuth dan pembacaan Firestore REST terverifikasi tanpa mencetak token.
- `FIREBASE_CLIENT_EMAIL` dan `FIREBASE_PRIVATE_KEY` dipasang sebagai Cloudflare secrets; file JSON tetap berada di luar repository.
- Firebase Hosting, Firestore Rules, dan Firestore Indexes berhasil dideploy ke `mtqhpinrang2027`; CSP dan bundle frontend memakai URL Worker produksi.
- Smoke test produksi nonmutasi memverifikasi health, CORS origin resmi, penolakan origin asing, dan penolakan request tanpa bearer token.
- UAT bearer token nyata lintas-role, operasi tulis, rotasi key, serta pengukuran CPU Worker Free tetap menjadi gate rilis resmi.

## Fase 13 — RES-202 State Machine Hasil Tepercaya (16 November 2026)

### Scope selesai

- Worker memverifikasi Firebase bearer token lalu membaca role assignment terkini sebelum setiap transisi hasil.
- State machine mendukung `draft → submitted → under_review → needs_revision|approved` dengan separation of duties.
- Pemenang diverifikasi ulang terhadap registration `verified`, golongan, slot konfigurasi, dan keunikan sebelum commit.
- Approval menulis submission, `officialResults`, dan audit secara atomik memakai precondition serta idempotency key.
- UI menyediakan tindakan sesuai permission dan menolak secara aman bila `VITE_WORKER_API_URL` belum dikonfigurasi.

### Batas

- Klasemen, policy poin, dan snapshot publik tetap nonaktif.
- Deployment Worker membutuhkan secret service account dan review IAM di luar repository; tidak ada secret yang dicatat ke Git.

## Fase 12 — Draft Hasil Lomba Terverifikasi (16 November 2026)

### Scope selesai

- Admin Cabang dapat membuat draft hasil dari slot penghargaan konfigurabel dan pendaftaran berstatus `verified` dalam scope cabangnya.
- Repository membatasi query 50 dokumen, menulis hasil dan `eventAudit` dalam batch atomik, serta memakai timestamp server dan idempotency key.
- Firestore Rules memvalidasi schema allowlist, scope cabang, relasi golongan, slot, status pendaftaran, keunikan pemenang, dan menolak field skor.
- Halaman menyediakan loading, empty, error, permission-aware, offline, dan success state dengan layout desktop/mobile.

### Batas aman

- Dokumen hanya berstatus `draft`; submit, approval, official result, klasemen, dan publikasi belum aktif.
- Tahap selanjutnya adalah RES-202 melalui Worker tepercaya dengan verifikasi token, separation of duties, dan idempotensi.

## Fase 11 — Konfigurasi Award Slots Draft (16 November 2026)

### Scope selesai

- Golongan menyimpan maksimal enam `awardSlots` terurut berupa ID teknis stabil dan label, terpisah dari status `awardSlotsStatus=draft`.
- Editor Master Data memakai format satu baris `id-teknis|Label`, mendukung konfigurasi kosong, memvalidasi format, batas, dan ID duplikat.
- Create/update golongan menulis konfigurasi dan `eventAudit` dalam batch atomik; revision serta timestamp server tetap berlaku.
- Rules hanya mengizinkan Super Admin/Admin Event, mempertahankan status draft, dan menolak perubahan role lain.

### Quality gate dan batas

- Unit test schema/parser, Rules test positif/negatif, serta E2E desktop/mobile ditambahkan.
- Konfigurasi slot belum merupakan keputusan resmi dan belum mengaktifkan UI input hasil, poin, atau klasemen.
- Tahap selanjutnya: repository pengajuan hasil dengan pemenang hanya dari registration `verified`, lalu UI hasil tanpa skor.

## Fase 10 — Fondasi RES-201 Hasil Lomba (16 November 2026)

### Scope selesai

- Kontrak TypeScript dan schema Zod untuk pengajuan hasil berbasis `branchId`, `divisionId`, slot penghargaan dinamis, `entryId`, berita acara, tanggal penetapan, dan catatan terbatas.
- Validasi satu sampai enam slot, award ID unik, entry pemenang unik, ID teknis stabil, dan payload strict yang menolak field asing termasuk `score`/`nilai`.
- Lima unit test mencakup payload valid, entry ganda, slot ganda, field skor terlarang, dan metadata penetapan invalid.

### Default aman dan tahap lanjutan

- UI input hasil tetap feature-off karena daftar `awardSlots` per golongan belum disahkan dan belum tersedia pada konfigurasi admin.
- Tahap berikutnya menambahkan konfigurasi award slot draft, rules/repository pengajuan atomik, pemilihan hanya registration `verified`, lalu UI responsif.
- Tidak ada data hasil resmi, klasemen, atau publikasi yang dibuat pada fase fondasi ini.

## Fase 09 — REG-104 Ekspor Registrasi Privat (16 November 2026)

### Scope selesai

- Ekspor CSV UTF-8 BOM untuk Super Admin, Admin Event, dan Admin Kafilah dari daftar yang sudah lolos query scope Firestore.
- Ekspor mengikuti filter status/pencarian aktif dan dibatasi snapshot maksimal 50 entri untuk menjaga kuota Spark.
- Metadata file mencantumkan event, timestamp WITA, scope, filter, jumlah entri, serta label `DRAFT INTERNAL`.
- Kolom hanya memuat ID teknis, tipe, nama entri, kecamatan, golongan, dan status; kontak, catatan, actor UID, audit, NIK, dan tanggal lahir tidak diekspor.
- Sel CSV dinetralkan terhadap formula injection dan kutip diproses sesuai format CSV.

### Quality gate

- Tiga unit test baru untuk field allowlist, BOM/metadata, formula injection, escaping, serta nama file WITA.
- Playwright memverifikasi unduhan dan nama file; screenshot desktop/mobile disimpan di `artifacts/screenshots/phase-09/`.
- Tidak ada read/write Firestore tambahan saat ekspor karena file dibuat dari snapshot daftar yang sudah dimuat.

## Fase 08 — Worker Verifikasi Final Registrasi (16 November 2026)

### Scope selesai

- Endpoint versioned `POST /v1/events/:eventId/registrations/:entryId/verify` dengan Firebase JWT, origin allowlist, batas body 8 KiB, dan schema Zod ketat.
- Worker membaca `roleAssignments/{uid}` via Firestore REST dan hanya menerima `event_admin`/`verifier` aktif pada event.
- Validasi status, eligibility, reviewer pemegang pemeriksaan, event, serta pemisahan pembuat dan pemverifikasi.
- Commit atomik mengubah registration dan membuat `eventAudit`; precondition `updateTime` mencegah lost update dan audit ID deterministik mencegah duplikasi.
- OAuth service-account memakai JWT RS256 dengan access token cache in-memory; credential hanya berasal dari Worker secret.

### Quality gate dan kuota

- Worker: 13 unit/integration tests meliputi sukses, HTTP boundary/CORS, replay, role salah, reviewer salah, self-verification, dan status ilegal.
- Verifikasi normal memakai empat Firestore REST subrequest; refresh access token menambah satu permintaan OAuth. Tidak ada listener atau layanan Firebase berbayar.
- UI tetap feature-off. Worker belum dideploy karena IAM minimum, secret, pengukuran CPU Free, token nyata staging, dan persetujuan operasional belum tersedia.

## Fase 07 — Hardening Kandidat Uji Coba (16 November 2026)

### Scope

- Kandidat uji coba dibatasi untuk demonstrasi internal dengan data simulasi; belum merupakan rilis produksi.
- Firebase Hosting dikonfigurasi dengan CSP, anti-frame, nosniff, referrer policy, permissions policy, immutable asset cache, dan `no-cache` untuk shell HTML.
- Tiga logo sumber tetap dipertahankan; varian WebP 1024 px digunakan pada runtime untuk menurunkan payload dan meningkatkan keberhasilan deployment tanpa mengubah fungsi identitas.
- Environment lokal produksi dan emulator tetap diabaikan Git; build output, debug log, dan credential file tidak masuk source control.

### Batas rilis

- Checklist identitas resmi, aturan lomba, privasi, operasional, dan verifikasi final belum disahkan.
- Akun produksi tidak dibuat otomatis. Pengujian workflow lengkap tetap menggunakan Auth/Firestore Emulator.
- Deployment yang diizinkan pada fase ini hanya preview/uji coba berlabel simulasi, bukan kanal produksi resmi.

## Fase 06 — Pengajuan & Pemeriksaan Administratif (16 November 2026)

### Scope selesai

- Transisi `draft/revision_required → submitted → under_review → revision_required/rejected` dengan timestamp server, actor, idempotency key, dan audit atomik.
- UI tindakan berbasis role, filter status, indikator antrean, modal keputusan, dan alasan wajib 10–300 karakter.
- Admin kafilah hanya mengajukan entri buatannya sendiri; reviewer berbeda mengambil pemeriksaan dan hanya reviewer tersebut yang dapat memutuskan.
- Status `verified` sengaja tetap tidak tersedia dari browser dan ditolak oleh Firestore Rules.

### Quality gate

- Frontend: 12 unit tests; Worker: 5 unit tests.
- Firestore Emulator: 14 integration tests termasuk self-review, alasan pendek, transisi ilegal, dan percobaan `verified` dari client.
- Playwright: alur dua akun admin kafilah → verifikator lulus; screenshot desktop/mobile tersimpan di `artifacts/screenshots/phase-06/`.

### Dampak kuota dan batas fase

- Setiap perubahan status memakai dua writes atomik: registration dan event audit; tidak ada realtime listener.
- Pemeriksaan tidak mengunggah berkas identitas dan tidak menambah data sensitif baru.
- Verifikasi final memerlukan endpoint Worker yang membaca role server-trusted, memvalidasi idempotensi, dan menulis transaksi dengan audit. Fitur tetap off sampai prasyarat itu selesai.

## Fase 05 — REG-102 Pendaftaran Peserta & Regu Draft (16 November 2026)

### Scope selesai

- Daftar pendaftaran privat dengan query dibatasi maksimal 50 entri dan pencarian lokal.
- Wizard tiga langkah untuk peserta individual dan regu; kecamatan admin kafilah terkunci oleh assignment.
- Entitas peserta/regu, registration, dan event audit ditulis dalam satu batch atomik dengan idempotency key.
- Semua entri baru tetap `draft` dan `needs_manual_review`; NIK, tanggal lahir, berkas identitas, serta foto tidak dikumpulkan.
- State loading, empty, error, offline, permission/read-only, dan success tersedia pada layar pendaftaran.

### Keamanan dan pengujian

- Rules membatasi schema create, scope kecamatan, actor UID, timestamp server, ukuran anggota regu, dan audit append-only.
- Verifikator hanya membaca pada slice ini; create hanya untuk super admin, event admin, dan admin kafilah.
- Frontend memiliki 11 unit tests; Firestore Emulator memiliki 13 rules integration tests termasuk negative test lintas wilayah.
- Playwright flow pendaftaran admin kafilah lulus; screenshot desktop dan mobile tersimpan di `artifacts/screenshots/phase-05/`.

### Dampak kuota dan batas fase

- Halaman menggunakan pembacaan sekali jalan tanpa realtime listener; master data dan 50 pendaftaran terbaru dimuat paralel.
- Setiap pendaftaran menghasilkan tiga writes atomik: entitas privat, registration, dan audit.
- Pemeriksaan duplikat UI hanya proteksi awal. Enforcement global, edit/submit, review verifikator, CSV, dan export dilanjutkan pada slice berikutnya.
- Golongan, usia, dan kuota masih draft sehingga sistem tidak mengambil keputusan eligibility otomatis.

## Fase 04 — REG-101 Master Data Draft (16 November 2026)

### Scope selesai

- Event draft, 12 kecamatan resmi, delapan cabang referensi draft, dan tiga golongan contoh.
- Halaman admin responsif dengan tab, pencarian, loading, empty, error, offline, permission, dan success state.
- Create/update cabang dan golongan dengan ID stabil, revision counter, idempotency key, dan audit atomik.
- Delete fisik, enable, serta approval master data tetap ditolak.

### Quality gate

- Frontend: 9 unit tests lulus; Worker: 5 unit tests lulus.
- Firestore Emulator: 12 rules integration tests lulus.
- Playwright: 3 E2E tests lulus termasuk write master oleh Admin Event dan viewport 390 px tanpa overflow.
- Screenshot tersimpan di `artifacts/screenshots/phase-04/`.

### Dampak kuota

- Halaman memuat empat request paralel berukuran kecil: event, kecamatan, cabang, dan golongan; tanpa realtime listener.
- Setiap perubahan master menghasilkan dua writes atomik: satu resource dan satu audit.
- Pencarian dilakukan lokal karena koleksi master kecil; tidak menambah Firestore reads per ketikan.

### Batas fase

- Cabang/golongan seed hanya referensi draft, `enabled=false`, dan bukan keputusan resmi.
- Perubahan status approved/published belum tersedia dan harus melalui Worker tepercaya pada fase approval.
- Registrasi peserta/regu, verifikasi, CSV, export, dan jadwal belum dikerjakan pada slice ini.

## Fase 03 — User Lifecycle, Profil & Activity (15 November 2026)

### Scope selesai

- Akun emulator untuk delapan role, password sementara, dan first-login password gate.
- Profil privat mandiri, daftar assignment read-only, perubahan password dengan reauthentication, dan aktivitas akun append-only.
- Navigasi profil, UI desktop/mobile, serta Playwright E2E berbasis build mode emulator.

### Quality gate

- Frontend 6 unit tests dan Worker 5 unit tests lulus.
- Firestore Emulator 9 rules integration tests lulus.
- Playwright 2 E2E tests lulus; screenshot desktop dan 390 px tersimpan di `artifacts/screenshots/phase-03/`.

### Batas fase

- Akun hanya ada di Auth Emulator; tidak ada user produksi dibuat.
- `users/{uid}/activity` adalah log operasional client-terbatas, bukan pengganti audit sensitif Worker.
- Pembuatan/penonaktifan akun dan assignment role produksi belum memiliki endpoint administratif.
- `npm audit --omit=dev` melaporkan advisory transitive `@grpc/grpc-js` melalui Firebase; saran otomatis adalah downgrade mayor Firebase sehingga tidak diterapkan. Pantau rilis upstream dan evaluasi ulang sebelum deploy.

## Fase 02 — Auth, RBAC & Security Boundary (15 November 2026)

### Scope selesai

- Firebase Auth provider modular dan mode emulator eksplisit.
- Login, reset password, pending/disabled account, protected route, permission-aware sidebar, serta sign-out.
- Firestore Rules default-deny dengan akses event/kecamatan/cabang dan public projection.
- Fixture Auth + role assignment emulator melalui script bootstrap lokal yang dikunci ke flag emulator.
- Worker skeleton read/no-write untuk verifikasi token dan request envelope.

### Quality gate

- Frontend: 6 unit tests.
- Worker: 5 unit tests.
- Firestore Emulator: 6 rules integration tests, seluruhnya lulus.
- Lint dan TypeScript strict frontend/Worker lulus.
- Build produksi lulus; bundle awal portal publik turun dari sekitar 716 KB menjadi 337 KB minified setelah route/component code splitting.
- Screenshot login desktop dan mobile tersimpan di `artifacts/screenshots/phase-02/`.

### Batas fase

- Auth provider produksi belum diaktifkan melalui Firebase Console oleh agent.
- Tidak ada akun produksi yang dibuat dan tidak ada role produksi yang ditulis.
- Worker belum dideploy dan belum memiliki service credential.
- Approval hasil, assign role, dan publish tetap belum memiliki endpoint tulis.

### Dampak kuota

- Login memuat maksimum satu dokumen `roleAssignments/{uid}` dan hanya refresh saat perubahan auth/permintaan manual.
- Rules membaca role assignment pada akses privat; query UI harus tetap scope-aware untuk menekan read dan menghindari denial.

## Fase 01 — Foundation UI (15 November 2026)

### Scope selesai

- Monorepo dan quality scripts.
- `PublicShell` dan `AdminShell` responsif.
- Beranda publik, dashboard admin, klasemen demonstrasi, route placeholder aman, halaman 403 dan state dasar.
- Tiga logo paket digunakan menurut fungsi identitasnya. Otorisasi final tetap mengikuti D-11 dan tidak diubah menjadi `APPROVED`.
- Firebase Hosting SPA dan Firestore default-deny.

### Quality gate

- `npm run lint`: lulus.
- `npm run typecheck`: lulus.
- `npm run test`: 2 unit test lulus.
- `npm run build`: lulus.
- HTTP preview `/` dan `/app/dashboard`: 200 melalui SPA fallback.
- Screenshot: `artifacts/screenshots/phase-01/`.

### Batas fase

- Firebase Auth, RBAC, rules granular, emulator integration test, formulir pendaftaran, workflow hasil, CMS, Worker, dan API belum diimplementasikan.
- PNG sumber beresolusi tinggi menghasilkan payload aset sekitar 4 MB; perlu turunan WebP/AVIF yang disetujui tanpa mengganti master asli.
- Bundle awal memuat chart dan masih perlu route-level code splitting.

### Keputusan aman

- Seluruh data operasional tetap simulasi/draft.
- Logo ditampilkan sebagai aset paket dengan label menunggu verifikasi panitia.
- Tidak ada write produksi dan tidak ada deployment.
- Konfigurasi Firebase client disimpan pada `.env.local` yang diabaikan Git. `storageBucket` dari snippet konsol tidak diteruskan ke aplikasi karena Cloud Storage dilarang pada arsitektur Spark-only ini.
## Fase 14 — Katalog dan data simulasi lengkap (17 November 2026)

### Cakupan selesai

- Redaksi pengguna dirapikan agar istilah infrastruktur tidak tampil pada halaman operasional.
- Formulir akun, pemulihan akun, data acuan, pendaftaran, dan hasil memakai validasi bertema aplikasi tanpa popup validasi bawaan browser.
- Katalog simulasi berisi 8 cabang dan 46 golongan draf berdasarkan pola umum penyelenggaraan MTQ; seluruh keputusan Pinrang 2027 tetap menunggu juknis.
- Seed emulator menghasilkan 138 pendaftaran yang mewakili semua kecamatan dan golongan, berikut peserta/regu, jadwal draf, serta pengajuan hasil draf tanpa skor.
- `npm run reset:emulator-demo` membersihkan seluruh akun dan data lokal dengan target emulator tetap.

### Quality gate

- Lint dan TypeScript strict: lulus.
- Unit test frontend 21/21 dan Worker 23/23: lulus.
- Firestore Rules 16/16: lulus, termasuk penolakan field skor.
- Build frontend dan Worker: lulus.
- Seed, reset, dan seed ulang emulator: lulus.

### Batas fase

- Data simulasi tidak dideploy ke Firestore produksi.
- Golongan, persyaratan, batas usia, kuota, jadwal, dan hasil belum resmi serta tetap nonaktif/draf.
- Cabang Hadis belum dimasukkan sampai ada keputusan resmi panitia.
## Fase 16 — Pagination pendaftaran hemat baca (17 November 2026)

### Cakupan selesai

- Daftar pendaftaran menggunakan cursor Firestore dengan 25 entri per halaman dan urutan stabil `createdAt` lalu ID dokumen.
- Navigasi sebelumnya/berikutnya mempertahankan batas kewenangan kecamatan, menampilkan nomor halaman, serta kembali ke halaman pertama setelah entri baru dibuat.
- Ekspor tetap memakai data halaman aktif dan metadata berkas menjelaskan batas 25 entri secara jujur.
- Indeks komposit kecamatan dan waktu dibuat untuk query admin kafilah tanpa membuka akses lintas wilayah.
- Layout tabel dan kontrol pagination tidak menimbulkan overflow halaman pada viewport 390 px.

### Quality gate

- Lint, TypeScript strict, 21 tes frontend, dan 23 tes Worker lulus.
- E2E terhadap 138 pendaftaran emulator memverifikasi halaman pertama/kedua, masing-masing 25 baris, navigasi kembali, dan tampilan desktop/mobile.
- Screenshot tersimpan di `artifacts/screenshots/phase-16/`.

### Dampak kuota

- Setiap perpindahan halaman membaca maksimal 26 dokumen; dokumen ke-26 hanya dipakai untuk mengetahui keberadaan halaman berikutnya.
- Tidak ada realtime listener, count aggregation, atau pembacaan seluruh koleksi.
## Fase 17 — Peninjauan jadwal dan arena draf (17 November 2026)

- Route admin Jadwal & Arena kini memuat maksimal 50 sesi draf dan lokasi simulasi tanpa membuka operasi tulis dari browser.
- Filter cabang, tanggal simulasi, pencarian golongan/arena, serta reset filter tersedia pada desktop dan mobile.
- Seluruh kartu memakai label `SIMULASI`; tanggal, waktu, dan arena ditegaskan belum resmi.
- Firestore Rules mengizinkan akun aktif membaca jadwal internal dan menolak create/update/delete; pengujian Rules bertambah menjadi 17 skenario.
- Seed emulator menyediakan empat arena simulasi dan 46 sesi draf. Tidak ada jadwal yang diproyeksikan ke koleksi publik.
- Lint, TypeScript strict, 44 unit test, Rules, build, dan E2E desktop/mobile lulus.
