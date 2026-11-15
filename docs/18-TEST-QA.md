# 18 — Quality Assurance, Test Plan dan Definition of Done

## Lapisan testing
1. **Unit** Vitest: perhitungan poin/medali; sorting/ties; status transitions; Zod schema; date WITA; parsing CSV; format.
2. **Integration** emulator Firebase Auth+Firestore: query role, write scope, unauthorized denial, protected PII, invalid result, access news drafts.
3. **Worker integration** mocked Cloudinary/Firebase REST + valid signed JWT fixture, invalid token, expired, wrong audience, revoked role; Cloudinary signed upload params.
4. **E2E** Playwright: login tiap peran, mendaftarkan peserta, verifikasi, input hasil, approve, publikasi, berita foto, API/embed.
5. **Visual regression** compare screenshot mockup-guided layout desktop/tablet/mobile.
6. **Performance** Lighthouse public/admin, test load cached API, quota/CPU Worker, Cloudinary upload concurrency.
7. **Accessibility** axe-core, keyboard-only, zoom 200%, screenreader landmarks, color contrast, 44 px touch.

## Matrix test per scenario (P0 wajib)
| ID | Scenario | Expected |
|---|---|---|
| T-001 | User tanpa role buka `/app/admin` | Denied 403 + no Firestore sensitive reads |
| T-002 | Admin kafilah A membaca/edit peserta B | Denied rules, query not exposing docs |
| T-003 | Admin cabang Tilawah input hasil Tahfiz | Denied API/rules |
| T-004 | Dua juara memilih entry sama | Form + backend reject |
| T-005 | Hasil berisi entry belum verified | Reject, tidak ubah summary |
| T-006 | Hasil diajukan tapi belum approved | Tidak mengubah klasemen publik |
| T-007 | Approve hasil dua kali | Satu effective official version only |
| T-008 | Koreksi hasil disahkan | Recompute berdasar canonical data, menghapus award lama |
| T-009 | Regu tiga orang juara I | Hanya satu medal/poin bagi kecamatan |
| T-010 | Penentu policy berubah | Recompute konsisten, version bump |
| T-011 | Draft berita dibuka anonim | 403/404, tidak ada gambar/teks draft dari public endpoint |
| T-012 | Contributor memanggil publish | Denied |
| T-013 | Non-editor mengubah berita orang lain | Denied jika tak punya scope |
| T-014 | Public API query PII field | Tidak tersedia |
| T-015 | Gagal upload Cloudinary | Form recoverable; tidak buat published media record palsu |
| T-016 | Token ID palsu/JWT expire | Worker 401; no write |
| T-017 | Worker CPU/quota habis | UI menampilkan stale-time/fail state, tidak prompt upgrade |
| T-018 | Offline saat pengesahan | Aksi disabled, tidak ada false success |
| T-019 | 390px form hasil berita | No viewport overflow, tombol accessible |
| T-020 | Refresh `/berita/slug` | SPA route bekerja /index.html |
| T-021 | Embed di domain lain | Works without auth; CSP hanya frame allowed public route |
| T-022 | Photo dengan data sensitif | Perlu moderasi; tidak terbit otomatis |
| T-023 | `roleAssignments` ditulis langsung client | Denied |
| T-024 | Visitor mengakses link admin audit | Denied |
| T-025 | Tidak ada menu penilaian hakim | Valid pada navigation dan route list |

## Fixture demo
- Event 2027 draft; 12 kecamatan resmi.
- 8 cabang referensi dengan flag `draft`, golongan contoh tanpa mengklaim resmi.
- Minimal 36 registrasi individu, 4 regu, 3 role cabang, 2 admin kafilah, 1 admin pusat, 1 editor, 1 kontributor.
- 4 pengajuan hasil, 2 approved, 1 revision, 1 pending; 6 artikel dengan berbagai status.
- Semua nama `Peserta Contoh XX`, `Penulis Simulasi`, bukan data pribadi nyata.

## Kriteria release minimum
- No TypeScript/lint/build errors.
- 100% tests akses negatif P0 lolos emulator/Worker.
- 0 kebocoran PII dalam payload publik; manual inspect JSON sampel.
- All screenshots responsive accepted; hasil pengujian disimpan sebagai artefak CI.
- Semua operasi approve/publish auditable.
- Service architecture tetap Spark without billing.
- Daftar bug terbuka Severity 1/2 = nol sebelum go-live.
