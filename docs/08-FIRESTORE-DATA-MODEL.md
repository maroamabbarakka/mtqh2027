# 08 — Firestore Data Model, Index, dan Integritas

## Prinsip pemodelan
- Gunakan Firestore Standard, **satu database gratis**, project sama untuk satu lingkungan produksi; staging dengan emulator/proyek Spark lain bila tersedia.
- IDs stabil berbasis UUID/Firestore auto ID; `eventId` contoh `mtqh-pinrang-2027`, `districtId` slug; jangan pakai nama sebagai foreign key.
- Organisasi **event-scoped** agar 2027 tidak bercampur data tahun berikutnya; bedakan data internal dengan dokumen publik.
- Banyak dokumen kecil dan pagination; pertahankan ukuran dokumen <1 MiB (batas Firestore), target snapshot jauh di bawahnya.
- Hindari array tak terbatas di satu dokumen. Winner list terbatas 3–6 entri dapat disimpan di dokumen hasil.

## Skema koleksi yang disarankan
```text
users/{uid}                       # displayName, email, status, preferences (minimal)
  activity/{activityId}           # log akun pribadi append-only, event allowlisted
roleAssignments/{uid}             # assignments + accessByEvent terkompilasi; hanya backend/super admin
adminAudit/{logId}                # server-only, append-only

events/{eventId}                  # name, year, month, hostDistrictId, stage, timezone
  districts/{districtId}          # snapshot referensi 12 kecamatan
  branches/{branchId}             # Tilawah, Tahfiz, Tafsir, dsb
  divisions/{divisionId}          # branchId, golongan, gender, teamMode, quota, enabled
  kafilah/{districtId}            # profile kafilah, PIC, public summary
  participants/{personId}         # privat, identitas & fields sensitif
  teams/{teamId}                  # anggota sebagai refs, quota, districtId
  registrations/{entryId}         # participantId | teamId, divisionId, status
  venues/{venueId}                # arena, nama, deskripsi
  schedules/{scheduleId}          # published/draft, division, venue, date/time WITA
  resultSubmissions/{resultId}    # winner entryIDs, submit metadata, status, version
  officialResults/{divisionId}    # canonical approved result, version, active
  rankingPolicies/{policyId}      # configurable points & ranking/tie-break
  news/{articleId}                # draft->published, author/editor refs
  media/{mediaId}                 # Cloudinary publicId/secureUrl/caption/moderation
  announcements/{announcementId}  # pengumuman admin/masyarakat
  eventAudit/{auditId}            # transaksi bisnis dan tindakan moderator

publicEvents/{eventId}
  snapshots/{versionId}           # detail published snapshot immutable
  pointers/current                # activeVersion, updatedAt
  articles/{articleId}           # sanitized published representation (no drafts)
  schedules/{scheduleId}         # public-safe schedule
  announcements/{id}             # public-safe text
```

`users/{uid}/activity` adalah riwayat operasional akun yang dibuat client dengan schema dan jenis aksi terbatas (`login`, `profile_updated`, `password_changed`). Koleksi ini tidak menggantikan `adminAudit`/`eventAudit` sebagai audit keamanan sumber kebenaran, karena aksi sensitif tetap harus dicatat Worker tepercaya. Pemilik hanya dapat membaca dan menambah lognya sendiri; update/delete ditolak.

## Contoh dokumen penting
```json
{
  "eventId": "mtqh-pinrang-2027",
  "divisionId": "tilawah-anak-putra",
  "branchId": "tilawah",
  "name": "Tilawah Anak-anak Putra",
  "type": "individual",
  "gender": "putra",
  "registrationOpen": false,
  "enabled": true,
  "limitsStatus": "draft_awaiting_juknis",
  "awardSlots": ["first", "second", "third"],
  "pointPolicyId": "draft-5-3-1"
}
```
```json
{
  "eventId": "mtqh-pinrang-2027",
  "divisionId": "tilawah-anak-putra",
  "revision": 1,
  "status": "submitted",
  "winners": [
    {"award": "first", "entryId": "entry-a"},
    {"award": "second", "entryId": "entry-b"},
    {"award": "third", "entryId": "entry-c"}
  ],
  "submittedBy": "firebase-uid",
  "submittedAt": "SERVER_TIMESTAMP",
  "sourceDocumentNumber": "DRAFT-BA",
  "idempotencyKey": "uuid"
}
```

## Integritas relasional (server)
- Setiap `registration.divisionId` benar-benar ada dan enabled; `registration.districtId` konsisten dengan kecamatan peserta atau regu.
- Satu `entryId` hanya satu penghargaan dalam satu dokumen hasil, kecuali aturan joint winners disetujui sebagai bentuk berbeda.
- Semua `winners.entryId` harus `verified`, memiliki `divisionId` yang cocok, dan tidak sudah ditetapkan pada slot lain.
- Pemberian role harus disimpan server-only; data publik tidak refer ke PII.
- Tidak ada `score` atau field nilai Dewan Hakim.
- EventId immutable untuk hasil resmi dan artikel yang telah diterbitkan, kecuali migrasi tercatat.
- `revision`, `updatedAt`, `updatedBy` pada perubahan; perubahan status diaudit.
- Cabang/golongan yang dibuat client pada REG-101 selalu `status=draft` dan `enabled=false`; ID dokumen, `eventId`, serta status bersifat immutable. Setiap create/update dipasangkan dengan `eventAudit` melalui batch atomik dan idempotency key.

## Proyeksi authorization

`roleAssignments/{uid}` mempertahankan `assignments[]` sebagai sumber audit/antarmuka dan `accessByEvent.{eventId}` sebagai proyeksi server-trusted untuk evaluasi Firestore Rules:

```json
{
  "assignments": [{"role":"kafilah_admin","eventId":"mtqh-pinrang-2027","status":"active","districtIds":["tiroang"]}],
  "accessByEvent": {
    "mtqh-pinrang-2027": {"roles":["kafilah_admin"],"districtIds":["tiroang"],"branchIds":[]}
  },
  "disabled": false,
  "revision": 1
}
```

Kedua representasi hanya ditulis melalui bootstrap tepercaya/Worker. Client tidak boleh membuat atau memperbarui dokumen ini. Setiap perubahan assignment kelak wajib membangun ulang proyeksi secara atomik dan menambah audit.

## Indeks Firestore yang perlu disiapkan ketika query dibuat
- registrations: `districtId ASC, status ASC, createdAt DESC` dan `divisionId ASC, status ASC`.
- resultSubmissions: `status ASC, submittedAt DESC`, `branchId ASC, status ASC`.
- schedules: `status ASC, startAt ASC`, `divisionId ASC, startAt ASC`.
- news: `status ASC, publishedAt DESC`, `authorUid ASC, createdAt DESC`.
- Registrasi, berita dan hasil selalu event-scope koleksi terlebih dahulu.
- Buat `firestore.indexes.json` dari query nyata; dokumentasikan pesan index missing dari emulator/production.

## PII
`participants` di ruang privat; jangan menaruh NIK sebagai document ID, jangan masukkan NIK ke snapshot publik, log, analytics atau path Cloudinary. Nama publik pemenang hanya jika diizinkan dan sudah approved. Tanggal lahir, nomor induk, nomor telepon, alamat dan dokumen verifikasi perlu minimisasi dan retensi.

## Data dummy
Semua fixtures menggunakan nama `Peserta Contoh 001` dan distrik resmi, dilarang menggabungkan juara hasil MTQ 2026 ke data 2027.
