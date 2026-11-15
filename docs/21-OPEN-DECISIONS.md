# 21 — Open Decisions & Assumption Register

Status `OPEN` = belum menjadi keputusan resmi, jangan diprogram hardcode; `PROPOSED` = pilihan teknis sementara; `APPROVED` = ditetapkan pihak berwenang dengan tanggal/bukti.

| ID | Keputusan | Default sementara | Status | Penanggung jawab |
|---|---|---|---|---|
| D-01 | Tanggal dan venue MTQH XXXV | Januari 2027, Tiroang; detail TBD | OPEN | Panitia |
| D-02 | Cabang/golongan final | 8 cabang referensi; flag draft | OPEN | LPTQ/Panitia |
| D-03 | Cabang Hadis di MTQH | Nonaktif | OPEN | Panitia |
| D-04 | Usia/kuota & persyaratan per golongan | Config nullable; manual verification | OPEN | Sekretariat |
| D-05 | Skema poin | 5/3/1 hanya simulasi, tidak aktif final | OPEN | Panitia |
| D-06 | Penentuan juara umum | Points vs medal ranking belum dipilih | OPEN | Panitia |
| D-07 | Juara bersama/tie-break | Default off; tampilkan seri | OPEN | Panitia |
| D-08 | Harapan I–III pada tiap golongan | Config per golongan | OPEN | Panitia |
| D-09 | Tim editorial dan kewenangan publikasi | Editor separate from contributor | PROPOSED | Humas/Kominfo |
| D-10 | Kebijakan nama/foto peserta anak | Private by default; consent required | OPEN | Pengendali data |
| D-11 | Logo, QR resmi, domain | Placeholder aman | OPEN | Panitia |
| D-12 | Kuota media harian dan retensi | 5–10 foto/kiriman, 0.5MB each | PROPOSED | Developer/Editor |
| D-13 | Data terbuka API detail pemenang | Hanya nama publik yang disetujui | OPEN | Panitia |
| D-14 | Aturan koreksi hasil & otorisasi akhir | Admin pusat dengan audit | PROPOSED | Panitia |
| D-15 | Kebutuhan SEO social card per artikel | SPA fallback sampai solusi tanpa billing disepakati | OPEN | Kominfo |
| D-16 | Otorisasi verifikasi final peserta | Feature off; wajib endpoint Worker server-authoritative dan audit | PROPOSED | Sekretariat/Developer |

## Protokol perubahan
- Catat siapa, kapan, apa dasar dokumen keputusan, nomor surat dan versi schema.
- Jika mengubah poin/kategori, lakukan migrasi config dan recompute snapshot dengan `dataVersion` baru.
- Bila perubahan menyangkut privasi, lakukan review keamanan dan dampak pada API/media.
- Agent harus mengangkat Open Decisions di PR, bukan mengambil kebijakan sendiri.
