# Codex Phase 04 — Hasil Juara + Pengesahan + Klasemen

## Baca
`docs/11-RESULTS-STANDINGS.md`, `docs/04-WORKFLOWS.md`, `docs/25-API-CONTRACTS.md`, `docs/18-TEST-QA.md`.

## Implementasi
1. Input juara I/II/III, harapan opsional per division dari eligible registrations; tim support.
2. Branch admin boleh draft/submit dalam scope; tidak bisa approve sendiri.
3. Worker privileged approve/return dengan verify ID token, role status/scope, Zod validation, optimistic version precondition, idempotency key.
4. Pure function standings: hits first/second/third/honorable, score policies configurable points/medals, 12 kecamatan termasuk nol, tie behavior ditandai.
5. Public `officialResults` dan versioned immutable snapshots; release pointer setelah valid.
6. Dashboard perolehan poin/medali dan riwayat koreksi; no false live state.
7. Test correction replaces official version and recompute rather than incrementally double count.

## Kriteria stop
- Jangan melanjutkan bila approval dapat dipalsukan via Firebase client direct write.
- Jangan melanjutkan bila satu klik dua kali menghasilkan poin ganda.
- Jangan mengimplementasikan fitur penilaian atau input skor hakim.
- Jika Worker Free CPU > limit, optimasi/desain ulang **tanpa** upgrade plan.
