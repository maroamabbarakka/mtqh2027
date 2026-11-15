# 11 — Input Juara, Pengesahan dan Mesin Klasemen

## Invariant utama
**Aplikasi tidak mengumpulkan nilai hakim.** Sumber data adalah daftar pemenang yang telah ditetapkan oleh panitia/dewan penetapan di luar aplikasi. Pemenang dipilih dari `registrations` yang sudah verified sesuai nomor lomba dan jenis individual/beregu.

## Data award
`first`, `second`, `third`, `honorable_1`, `honorable_2`, `honorable_3`. Array `awardSlots` ditentukan per `division`, dan slot yang tidak dipakai tidak muncul. Juara bersama/joint title harus menjadi config tersendiri dan membutuhkan kebijakan terperinci; **default off**.

## Policy klasemen dapat diatur
Contoh DRAFT yang hanya untuk simulasi:
```json
{
  "id": "draft-5-3-1",
  "label": "Simulasi Pinrang (menunggu juknis)",
  "status": "draft",
  "points": {"first": 5, "second": 3, "third": 1, "honorable_1": 0, "honorable_2": 0, "honorable_3": 0},
  "primaryRanking": "points",
  "tieBreak": ["first", "second", "third", "districtNameAsc"],
  "teamCountsAs": "one_award",
  "jointWinnersEnabled": false
}
```
Alternatif simulasi `9,7,5,3,2,1` juga diizinkan sebagai preset draft. **Jangan aktifkan aturan juara umum tanpa keputusan panitia**.

## Perhitungan deterministik
Input: seluruh `officialResults` aktif, policy yang sudah approved, master entries/kafilah valid.
- Untuk tiap entry pemenang, resolve `districtId` dari snapshot registrasi yang di-approve.
- Tambah `medalCounts` (first=emas, second=perak, third=perunggu), penghargaan harapan disimpan terpisah.
- Tambah `points += policy.points[award]` dengan satu penghargaan dihitung sekali; beregu **satu** award.
- `primaryRanking=points`: sort descending total points, tie first/second/third, lalu nama kecamatan stabil hanya untuk pengurutan tampilan; status `seri` bila tie resmi tidak ditentukan.
- `primaryRanking=medals`: sort desc emas, perak, perunggu, lalu points jika ditetapkan. Jangan menganggap tie-break nama alfabet sebagai ketetapan juara umum.
- Output 12 row termasuk nol medali, meta `basedOnOfficialResults`, `updatedAt`, `rankingPolicyId`, `dataVersion`.
- Peringkat bersama harus mengikuti aturan resmi; jika belum tersedia, tampilkan `peringkat sementara`.

## Idempotensi dan concurrency
1. Kunci unik per division pada `officialResults/{divisionId}`; active result mempunyai `revision`.
2. Submit memakai `idempotencyKey`; klik berulang tidak menghasilkan entri baru.
3. Approval Worker mengecek status submitted, role, version dan precondition untuk menghindari race.
4. Operasi approval harus meninggalkan canonical official result + audit + public snapshot pointer versi yang konsisten; ideal satu transaksi dengan batas operasi wajar.
5. Correction memakai `supersedesRevision`, tidak menambah incremental poin; **recompute total from canonical officialResults** lalu publish snapshot versi baru.
6. Bila compute penuh > CPU limit Worker Free, gunakan update work queue eksplisit oleh admin dalam beberapa langkah dengan status `publishing` dan pointer publik versi lama sampai final valid; jangan tayangkan snapshot parsial.
7. Semua rebuild harus bisa dijalankan ulang secara aman dan diverifikasi checksum total awards.

## Contoh UAT
- Admin Tilawah memilih P1 juara I, P2 juara II, P3 juara III; submit => tidak berubah klasemen.
- Event admin approve => poin dan jumlah penghargaan meningkat sesuai policy.
- Branch admin edit setelah submit => ditolak sampai returned for revision.
- Admin approve dua kali => hanya satu versi resmi.
- Koreksi juara I dari Tiroang ke Lanrisang => poin/emas Tiroang berkurang dan Lanrisang bertambah, **tidak ada duplikasi**.
- Juara tim Syarhil 3 anggota => perolehan satu juara bagi satu kecamatan.
- Ubah policy draft->approved sesuai SK => rebuild snapshot histori terkontrol, tampilkan metadata policy.

## UX verifikasi
Layar approval menampilkan daftar juara, asal kecamatan, nomor lomba, pengirim, lampiran berita acara jika diizinkan, waktu; dialog `Sahkan hasil dan perbarui klasemen?`. Pembatalan/koreksi harus minta alasan dan masuk audit.
