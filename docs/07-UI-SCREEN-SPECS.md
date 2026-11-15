# 07 — Spesifikasi Halaman UI Desktop, Tablet, Mobile, Videotron

## Breakpoints
- `xs` 320–479: smartphone sempit; navigation bottom/drawer; cards stacked; form single column.
- `sm` 480–767: phone besar/small tablet; KPI 2 kolom; filter horizontal scroll.
- `md` 768–1023: tablet; sidebar drawer; KPI 2 kolom; charts 1 kolom.
- `lg` 1024–1439: desktop; sidebar collapsible; KPI 3–4 kolom.
- `xl` ≥1440: full dashboard 4 KPI + 2-column chart/media; maximum reading width artikel 760 px.

## Screen A — Admin Dashboard `/app/dashboard`
Header: title "Dashboard MTQH XXXV Pinrang", status event, last sync, pilihan event (jika >1). Sidebar gradient teal, logo placeholder.
Row 1: 4–6 KPI data yang benar: kafilah aktif, peserta terdaftar, peserta terverifikasi, nomor lomba aktif, hasil resmi, kiriman berita perlu review. **Jangan tampilkan dewan hakim dan skor.**
Row 2: progres per fase (daftar->verifikasi->lomba->hasil), bar peserta per cabang, filter event.
Row 3: hasil baru disahkan, antrean approval, jadwal berikutnya, berita redaksi terbaru.
Footer: indikator Spark quota/staleness (estimasi penggunaan internal, bukan klaim quota live tanpa integrasi).
Action roles: kafilah `Daftarkan Peserta`; branch `Input Hasil`; contributor `Kirim Berita`; admin `Tinjau Pengesahan`.

## Screen B — Peserta & Regu
Desktop: tabel paginasi dengan kolom nomor, peserta/regu, kecamatan, cabang, golongan, status, aksi; filter + pencarian; drawer detail. Mobile: cards dengan status + menu aksi; tombol `Tambah Peserta` sticky.
Form wizard: identitas minimal -> pilihan lomba -> pernyataan persyaratan -> review. Field sensitif masked; validasi usia belum final bisa flagged instead of blocked.

## Screen C — Input Hasil Juara
Breadcrumb `Lomba > [Cabang] > [Golongan] > Hasil`; status dan daftar eligible entries. Dropdown dinamis untuk juara I, II, III, Harapan opsional; reject duplicate; dukung team. Tombol `Simpan Draft` dan `Kirim untuk Pengesahan`, dialog rekap. Tidak ada field komponen penilaian atau input skor.

## Screen D — Pengesahan
Dua panel: kiri kiriman baru/needs revision, kanan rincian juara, identitas penginput, sumber resmi/berita acara, diff versi; tombol `Kembalikan` + alasan atau `Sahkan` + konfirmasi dampak klasemen. Hanya admin pusat.

## Screen E — Media Center
Dashboard kiriman `Menunggu Editor`, `Perlu Revisi`, `Terbit`; daftar karya; komposer judul/lead/konten/caption; foto grid drag-drop + progress. Mode mobile kamera langsung; unggah offline tidak dipaksa jika jaringan gagal.

## Screen F — Public Homepage
Hero: nama resmi event, lokasi Kecamatan Tiroang, bulan Januari 2027 (**tanggal lengkap belum ada**); CTA `Lihat Klasemen`, `Jadwal Lomba`. Badges 12 kafilah, ringkasan hasil (dinamis). Di bawah: cards jadwal, hasil, data peserta publik (agregat), berita dan galeri. Footer mencakup kontak resmi hanya jika diputuskan.

## Screen G — Klasemen Publik
Tabs `Poin Kejuaraan` dan `Medali`, filter cabang, tanggal pembaruan, metodologi urutan. Desktop tabel 12 kecamatan; mobile horizontal local-scroll atau cards; klik kecamatan menuju penghargaan resmi.

## Screen H — Embed dan LED
`/embed/klasemen`: tanpa header/footer; adaptif dan dapat transparan/dark. `/display/led`: 16:9 1920×1080, informasi sangat jelas dari 10–20 m, safe margins 5%, fonts besar, auto-rotate antar panel dengan opsi manual pause. Tidak bergantung streaming listener untuk setiap layar; poling cache 30–60 detik.

## Screen I — Berita Detail
Cover 16:9, breadcrumbs, judul, lead, byline, tanggal WITA, artikel max-width 760 px, gambar dan caption, artikel terkait. Jangan expose nomor identitas anak.

## Screen J — Hak Akses
Desktop permission matrix; mobile daftar role dan scope. Setiap perubahan role menyatakan dampaknya, meminta konfirmasi, dan menghasilkan audit. Non-admin tidak boleh mengakses halaman ini bahkan via direct URL.

## State matrix semua halaman
- Loading: skeleton dengan dimensi yang stabil.
- Empty: penjelasan + CTA relevan per izin.
- Error: pesan aman, retry, jangan tampilkan stack trace.
- Offline/stale: banner dengan timestamp data terakhir, blokir pengesahan saat offline.
- Permission denied: halaman 403, jangan tampilkan data sebelum redirect.
