# Codex Phase 07 — Export, Quota, Backups dan Security Hardening

## Baca
`docs/16-REPORTING-EXPORT.md`, `docs/19-DEPLOYMENT-OPERATIONS.md`, `docs/22-THREAT-MODEL.md`, `docs/23-PERFORMANCE-CAPACITY.md`.

## Implementasi
1. CSV/XLSX/PDF export role-scoped sesuai filter; CSV formula injection defense.
2. Dashboard admin kuota yang **jelas sebagai estimasi** kecuali diambil dari sumber resmi.
3. Offline/stale banner, request retry, idempotency POST, errors 401/403/409/429/503.
4. Export JSON backup manual, restore dry-run emulator, checklist operasional.
5. Audit log immutable and viewer superadmin only; secrets env validation.
6. Lighthouse + accessibility + CPU Worker profiling; Cloudinary quota test; over-quota degrade.
7. Hardening CSP, sanitization, security rules deny cases, security tests.

## Gate
- No secrets in frontend git/build.
- PII absent in public export.
- Restore test passes on emulator.
- Emergency mode without Blaze works in local/staging simulation.
