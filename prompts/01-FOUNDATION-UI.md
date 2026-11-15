# Codex Phase 01 — Foundation, Dashboard UI, Responsive Shell

## Input yang wajib dibaca
`AGENTS.md`, `docs/06-DESIGN-SYSTEM.md`, `docs/07-UI-SCREEN-SPECS.md`, `docs/05-ROUTES-NAVIGATION.md`, `mockups/README.md` dan kedua PNG.

## Implementasi
1. Buat monorepo TypeScript strict + Vite React + Router + Tailwind/shadcn + Recharts + Lucide.
2. Tambahkan code quality lint, format, typecheck, tests dan build scripts.
3. Implementasi design tokens, AppShell desktop/sidebar collapsible, PublicShell, header, bottom nav mobile dan breadcrumbs.
4. Build pages dummy: dashboard admin, home publik, klasemen, peserta, cabang, hasil, berita, galeri, profil, settings (placeholder role aware).
5. Dashboard admin visual premium mengikuti layout mockup (sidebar teal gelap, card putih, chart emerald, highlight emas), **tanpa** menu "Penilaian" dan "Dewan Hakim".
6. Portal publik memiliki hero MTQH XXXV Kab. Pinrang 2027, informasi waktu `Januari 2027 • tanggal menunggu keputusan`, berita dummy bertanda SIMULASI.
7. Data fixtures 12 kecamatan nama resmi; 8 cabang referensi semua draft, grafik dummy dengan label `Data simulasi`.
8. Router dan page-level loading/error/empty states; responsif pada 360,390,768,1024,1440.

## Kriteria penerimaan
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` lulus.
- Screenshot desktop admin & publik serta screenshot mobile mencakup sidebar/drawer, KPI, chart, berita.
- Tidak ada overflow horizontal pada 360 px; tombol bisa ditekan jari dan fokus keyboard.
- Tidak ada Firestore production dependency untuk menjalankan demo.
- Navigasi dan istilah seluruhnya Bahasa Indonesia.

## Output agent
Tuliskan daftar file, perintah run, screenshot path dan issue yang harus dikerjakan fase berikutnya. Jangan melakukan deployment produk.
