# 17 — Engineering Architecture, Folder Struktur, Coding Convention

## Stack final
React 19+ compatible (gunakan versi stabil saat implementasi), TypeScript strict, Vite, React Router, TanStack Query, Firebase Modular SDK, Tailwind CSS, shadcn/ui, Radix primitives, Lucide, Recharts, React Hook Form, Zod, date-fns/Intl Asia/Makassar, Vitest + Testing Library, Playwright, Firebase Emulator Suite, Cloudflare Workers TypeScript. Jangan pakai Firebase Functions atau Cloud Storage SDK.

## Usulan monorepo
```text
mtqh-pinrang/
  AGENTS.md
  apps/
    web/
      src/
        app/            # router, providers, bootstrap
        components/     # UI primitives, layout, charts
        features/
          auth/ district/ event/ registration/ division/
          schedule/ results/ standings/ cms/ media/ reports/ roles/
        pages/public/ pages/admin/
        hooks/ services/ lib/ schemas/ config/ styles/ tests/
      public/            # brand placeholders & static manifests
      index.html
      vite.config.ts
    worker/
      src/
        index.ts
        auth/          # verify Firebase ID token/JWKS and role
        endpoints/     # media, approvals, public API
        firestore/     # signed REST client
        policies/      # field allowlists, validation
        tests/
      wrangler.toml
  packages/
    shared/             # Zod schemas + types + enums + pure standings algorithm
    ui/                 # optional when justified
  firebase/
    firestore.rules
    firestore.indexes.json
    firebase.json
  scripts/               # seed demo for emulator, validation, lint gates
  docs/                  # developer handoff docs
  mockups/               # source visuals
  .env.example
  package.json
  README.md
```

## Dependency boundaries
- `shared` menyimpan schema `Participant`, `Registration`, `Division`, `Result`, `Standing`, `Article` yang dipakai frontend/worker agar tidak drift.
- UI memanggil API lewat typed service functions, tidak menulis `getDoc`/`fetch` langsung dalam komponen kecuali hook resmi.
- Domain results pure function `computeStandings(officialResults,policy,districts)` dengan unit tests yang komprehensif; tidak tergantung Firebase.
- Firestore write sederhana (draft) lewat SDK + rules; operasi privilege/approval via Worker authenticated.
- Public frontend membaca Worker cached API; admin membaca Firestore scoped.
- Semua UI route memiliki error boundary.

## Coding guideline
- `strict:true`, no `any` tanpa alasan; Zod parsers untuk data dari Firestore/API.
- Penamaan `camelCase` JS, `PascalCase` React, `kebab-case` routes, `snake_case` API endpoint hanya jika konsisten; dates server timestamps.
- Console logging minimum; gunakan structured logging tanpa PII.
- Env `VITE_` hanya untuk nilai aman publik; secret server di Worker, bukan di `import.meta.env` client.
- Import alias, barrel exports seperlunya; 1 concern per modul; JSDoc singkat pada algoritma/edge cases.
- Unit tests untuk semua status transition/penghitungan; integration tests pada emulator rules.
- Changelog perubahan schema dengan migrasi manual yang bisa diulang dan rollback.

## Pengembangan lokal
`npm install` -> `npm run dev` -> emulator Firestore/Auth; Worker `wrangler dev` dengan local secrets dummy. `npm run check` harus menjalankan lint, typecheck, unit, keamanan rule tests, build. Test E2E menggunakan fixture demo (bukan data nyata).

## Error resilience
- Worker API `traceId` pendek pada error internal; jangan kirim stack trace.
- Client punya retry terbatas untuk GET idempotent. POST request perlu `Idempotency-Key` dan explicit retry.
- Offline browser hanya read cache, tidak mengizinkan `approve`, `publish`, atau assign roles saat offline.
- Daftar draft boleh disimpan lokal secara opsional **tanpa data sensitif**, dan pengguna diberi tahu tingkat keamanannya.
