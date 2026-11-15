# 12 — Pendaftaran, Verifikasi, Peserta Beregu, Jadwal

## Pendaftaran
Admin kafilah memilih event/kecamatan terkunci berdasarkan role. Input individual: nama lengkap resmi, jenis kelamin/kategori, informasi usia minimal untuk eligibility, kontak pengurus (bukan harus kontak anak), cabang, golongan. Field identitas tambahan dibuat **opsional/configurable** sesuai kebutuhan juknis; batasi data pribadi. Foto profil peserta bukan wajib.

## Regu
Entitas `teams` punya `teamId`, `districtId`, `divisionId`, `teamName` (jika relevan), `members` array references terbatas. Admin dapat mengubah personel sampai `registration_closed`, setelah itu harus lewat permintaan revisi beralasan.

## Validasi
- Tak boleh satu orang didaftar dua kali pada golongan yang sama dalam event yang sama.
- Jika aturan melarang lintas cabang/golongan, beri warning atau blok hanya setelah parameternya approved.
- Batas usia ditetapkan dengan `ageReferenceDate` dari config resmi, bukan tanggal sistem saat ini. Saat draft gunakan `eligibilityStatus=needs_manual_review`.
- Quota per kafilah-golongan configurable, warning jelas saat penuh.
- Verified entries tidak boleh dihapus secara fisik jika sudah terhubung official result; gunakan inactive/correction workflow.

## Verifikasi
List filter `submitted, revision_required, verified, rejected`; reviewer mencatat alasan, daftar berkas, cap waktu, revisi. Hindari berkas KTP/KK dipublikasikan melalui Cloudinary publik. Jika dokumen privat tidak bisa disimpan secara aman pada arsitektur gratis, **jangan implementasikan upload dokumen identitas sensitif**; gunakan verifikasi manual/offline dan simpan status non-sensitif.

## Jadwal
`venue`, `session`, `division`, `startAt/endAt`, `published`, `description`, `sessionNo`. Simpan timestamp UTC ISO/Firestore Timestamp, render WITA. Support filter menurut tanggal, cabang, lokasi, kategori, kafilah; status `draft` hanya internal. Nomor tampil opsional dan tidak mempengaruhi pengesahan juara.

## CSV import
Template header eksplisit: `fullName,districtId,branchId,divisionId,gender,teamId(optional),notes`; validasi preview per baris, deteksi duplikasi, commit batch dengan rollback/log; jangan auto-upload file mentah berisi PII ke media publik.

## Export
Admin kafilah hanya ekspor datanya sendiri; event_admin ekspor keseluruhan; publik hanya agregat atau nama yang disetujui. Timestamp export + filter/scope pada footer file.
