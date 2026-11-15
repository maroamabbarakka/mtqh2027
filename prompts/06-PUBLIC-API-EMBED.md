# Codex Phase 06 — Public Website, JSON API, Widget & Videotron

## Baca
`docs/15-PUBLIC-EMBED.md`, `docs/25-API-CONTRACTS.md`, `docs/07-UI-SCREEN-SPECS.md`.

## Implementasi
1. Portal publik komplet: beranda, cabang, jadwal, hasil, klasemen, statistik, berita, galeri, info.
2. Worker GET API v1 read-only di atas projection safe, TTL cache, CORS GET dan schema response.
3. Embed HTML routes: klasemen poin/medali, grafik, hasil terbaru; parameter theme/size filter yang aman.
4. Mode videotron 16:9 1920×1080 dengan font terbaca, auto-rotate, pause, stale timestamp, full screen.
5. Tidak query data privat; public API smoke test memverifikasi tidak ada email/NIK/phone/dob.
6. Pastikan iframe bekerja di domain berbeda, CSP frame ancestors yang kompatibel, admin anti-frame.
7. `SIMULASI` di semua contoh; SEO static SPA limitations didokumentasikan.

## Gate
- External website dapat embed dengan contoh iframe.
- Public JSON valid/schemaVersion/updatedAt; no private data.
- Site tidak attach per-visitor Firestore listener masif; gunakan cached Worker.
