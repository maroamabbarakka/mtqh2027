# 06 — Design System, Branding dan Aturan Fidelitas Mockup

## Design direction
**Premium Civic-Islamic SaaS** — menggabungkan kredibilitas portal pemerintah, tata letak data produk enterprise, gaya geometris Islami yang halus dan rasa modern. Referensi PNG dalam `mockups/`. Fokus kualitas layout, bukan menyalin teks/foto/identitas generatif.

## Token visual (nilai awal; dapat disesuaikan setelah logo resmi)
```css
:root {
  --brand-950:#062F31; --brand-900:#084344; --brand-800:#0C5652;
  --brand-700:#0D7668; --brand-600:#118D75; --brand-500:#16A085;
  --gold-600:#AD8435; --gold-500:#C9A04B; --gold-100:#FFF4DB;
  --surface:#FFFFFF; --canvas:#F4F7F7; --surface-muted:#EDF3F2;
  --ink:#142C32; --ink-muted:#587078; --border:#DAE5E3;
  --danger:#C2414B; --warning:#B97515; --success:#16805F;
  --radius-sm:8px; --radius-md:12px; --radius-lg:18px; --radius-xl:24px;
  --shadow-card:0 8px 28px rgba(3,38,39,.07);
}
```
- Font UI: `Plus Jakarta Sans` (fallback Inter, Arial, sans-serif), tersedia via lisensi yang sah/CDN atau bundel npm (jangan membagi file font khusus yang tidak berlisensi).
- Angka KPI: tabular numerals. Teks Arab hanya jika konten resmi, font dengan dukungan Arab yang valid.
- Spacing grid 4/8 px; kepadatan: desktop medium, mobile compact tanpa terlalu rapat.
- Icon: Lucide React, konsisten 18–22 px, stroke 1.75/2.
- Radius/card: 12–20 px; bayangan tipis, border elegan; jangan gunakan skeuomorphism berlebihan.
- Motif: decorative low-contrast hanya pada hero/banner, jangan di belakang tabel.

## Hierarki layout desktop
- Shell: sidebar 256–276 px fixed (collapsible ke 76 px); konten fleksibel dan max-width 1600 px; header 72 px.
- Dashboard hero header: ringkasan event, chip status, identitas akun, tombol aksi primer.
- KPI grid: 4 kolom (desktop besar), 2 kolom (tablet), 1–2 kolom (mobile).
- Charts: 2/3 + 1/3 grid; tabel berlapis kartu tanpa border berlebihan.
- Sidebar: deep teal gradient, active menu hijau, label Indonesia konsisten.
- Publik: header putih + hero teal/gold berornamen, CTA lihat klasemen/jadwal, berita editorial, footer profesional.

## Komponen desain wajib
`AppShell`, `PublicShell`, `Sidebar`, `BottomNav`, `Topbar`, `Breadcrumbs`, `KpiCard`, `StatTrend`, `ProgressRing`, `ChartPanel`, `DataTable`, `SearchFilterBar`, `RankMedalChip`, `StatusBadge`, `ApprovalTimeline`, `ArticleCard`, `MediaUploader`, `PhotoGrid`, `EmptyState`, `ErrorState`, `StaleDataBanner`, `ConfirmDialog`, `PermissionGuard`, `LoadingSkeleton`, `LiveStatus`.

## Spesifikasi UX
- Aksi destruktif selalu konfirmasi dan, untuk hasil resmi, minta alasan koreksi.
- Angka poin dan medali dapat diklik untuk menampilkan sumber penghargaan; tidak ada angka tanpa sumber.
- Kriteria pencarian tetap tersimpan dalam query parameters pada halaman indeks.
- Status terlihat sebagai **teks + ikon**, bukan warna saja.
- Empty state membimbing, mis. "Belum ada hasil disahkan".
- Kecepatan interaksi: skeleton 150–300 ms bila permintaan lama; hindari flash.
- Perangkat sentuh minimal 44×44 px; fokus keyboard jelas; caption foto wajib/opsional sesuai kebijakan.
- Tampilkan `SIMULASI` secara eksplisit pada demo, hapus seluruh dummy sebelum produksi.

## Mode gelap
Dark mode admin opsional setelah MVP, gunakan token warna terpisah dan uji kontras WCAG. Portal publik mengutamakan mode terang; hero tetap hijau gelap.

## Fidelity acceptance
1. Screenshot 1440×900, 1024×768, 768×1024, 390×844, 360×800.
2. Tidak ada horizontal overflow pada body mobile (kecuali tabel dengan scroll lokal berpetunjuk).
3. Dashboard admin desktop mempertahankan struktur sidebar + cards + charts seperti mockup.
4. Portal publik mempertahankan tema emerald/navy/emas, hero editorial, cards berita + statistik.
5. Teks menu tidak mengandung `Penilaian`, `Hakim input nilai`, tanggal/venue generatif.
6. Desain tetap mudah dipakai dengan teks diperbesar 200%.
