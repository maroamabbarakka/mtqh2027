# Referensi Visual Mockup dari Percakapan

Dalam folder ini terdapat **dua file PNG mockup yang dihasilkan pada percakapan sebelumnya**, disertakan sebagai acuan visual, bukan hasil tangkapan layar aplikasi yang sudah berjalan.

| File | Fokus visual | Perlu dikoreksi saat implementasi |
|---|---|---|
| `01-MOCKUP-DASHBOARD-PUBLIC-MOBILE.png` | Dashboard admin kiri, portal publik kanan, mobile, kartu fitur | Menampilkan event generik/2025 dan beberapa menu penilaian; seluruh data harus diganti |
| `02-MOCKUP-DASHBOARD-PORTAL-DETAIL.png` | Header premium, kartu statistik, dashboard, portal berita, perangkat mobile | "2025", "Tingkat Provinsi", fitur penilaian, nama tempat generatif; harus dihapus |

## Tujuan fidelity
- **Tiru:** estetika warna hijau teal/emerald + gold, tipografi hirarkis, sidebar profesional, KPI cards terang, charts, berita editorial, header publik, responsif mobile, interaksi ringan.
- **Jangan tiru:** angka statistik generatif, tanggal/nama daerah dan lomba tidak resmi, foto/landmark yang tidak terkait, logo generatif sebagai logo resmi, menu/field e-scoring.
- **Ubah menjadi:** `MTQH XXXV Kabupaten Pinrang 2027`, `Kecamatan Tiroang`, `Januari 2027 (tanggal dalam persiapan)`, `Input Hasil Juara`, `Klasemen`, `Berita & Galeri`, `Integrasi Data`.
- **Gunakan assets resmi:** logo Pinrang/MTQH diperoleh dari panitia dan dipasang persis; sebelum ada, tampilkan badge atau wordmark placeholder yang jelas.

## Komparasi visual yang harus ditest
- Dashboard 1440×900: sidebar, top header, cards statistik, chart dan feed berita memiliki ritme grid mirip mockup.
- Publik 1440×900: hero premium, kategori info, berita utama, statistik, rekap hasil.
- Mobile 390×844: bottom nav/drawer, KPI 2 kolom, chart satu kolom, forms mudah disentuh.
- Videotron 1920×1080: font besar, safe margin, klasemen podium tabel.

PNG adalah **raster**, bukan file Figma/design-system editable. Codex harus menerjemahkannya secara terukur menjadi komponen HTML/CSS responsif; kesamaan pixel-perfect tidak bisa dijamin tanpa sumber desain berlapis tetapi kesetiaan struktur dan estetika harus dijaga.
