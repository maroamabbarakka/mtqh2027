# Codex Phase 08 — UAT, Review Mockup, Launch Gate

## Baca
`docs/18-TEST-QA.md`, `docs/29-RELEASE-CHECKLIST.md`, `mockups/README.md`, `docs/21-OPEN-DECISIONS.md`.

## Implementasi
1. Audit selesai semua P0, laksanakan E2E multi-role (panitia, kafilah, cabang, editor, publik).
2. Visual compare screenshot desktop 1440×900, tablet 768×1024, mobile 390×844 & 360×800 dengan mockup; koreksi layout bukan fakta salah.
3. Test 12 kecamatan, simulasi 800 peserta, 48 nomor referensi *draft*, ≥30 perubahan hasil, 200 berita/foto dummy; ukur Firestore reads/Worker CPU.
4. Lint/typecheck/unit/integration/Playwright/a11y/build lulus; validasi deploy classic hosting.
5. Buat `UAT-REPORT.md` berisi per requirement status PASS/FAIL, screenshot, log, isu, keputusan terbuka.
6. Jika akses Firebase nyata tidak diberikan, **jangan klaim deploy**; keluarkan panduan perintah manual & daftar konfigurasi.
7. Tegakkan freeze: tidak ada logo tidak resmi, tanggal pasti fiktif, nama pemenang buatan, menu penilaian hakim.

## Output wajib
- Ringkasan fitur berfungsi dan yang belum dibuat.
- Daftar perintah reproducible dan hasilnya.
- Bukti test role dan QA mobile.
- Daftar keputusan panitia yang menahan go-live.
- Checklist keamanan dan Spark-only signoff.
