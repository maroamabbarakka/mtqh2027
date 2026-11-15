# Codex Phase 02 — Firebase Spark, Auth & Role Authorization

## Baca
`docs/03-RBAC.md`, `docs/08-FIRESTORE-DATA-MODEL.md`, `docs/09-SPARK-COST-GUARDRAILS.md`, `docs/10-SECURITY-AUTH.md`, `docs/22-THREAT-MODEL.md`.

## Implementasi
1. Setup Firebase SDK modular client; emulator Auth+Firestore; `firebase.json` Hosting klasik + rules/indexes.
2. `Login`, `Lupa Password`, `Akun Pending`, profile minimal, ProtectedRoute, scoped navigation.
3. Firestore Rules default-deny, role assignments read self/server-only write, user profile strict allowedKeys.
4. Seed akun demo menggunakan emulator dan role assignment trusted bootstrap script (bukan app public).
5. Private queries dibatasi role+scope. No direct public access PII.
6. Worker project skeleton (`wrangler`) + verified Firebase ID token helper + Zod request envelope + service credential safe secret placeholders; jangan mengaktifkan Worker paid.
7. Tulis emulator rules tests untuk IDOR/cross-scope/self-escalation, token invalid, admin disabled.

## Test gates
- 2 admin kafilah: tidak dapat membaca/edit data kecamatan lain.
- Branch admin tidak dapat mengedit hasil cabang lain.
- Contributor tidak dapat menerbitkan sendiri.
- Public hanya dapat membaca `publicEvents` yang aman.
- Tidak ada billing attachment atau produk Firebase terlarang.

**Jangan** membuat akun super admin melalui public API tanpa bootstrap manual yang aman.
