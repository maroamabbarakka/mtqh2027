# 22 — Threat Model dan Mitigasi Prioritas

## Boundary
1. Browser tanpa login -> data publik/snapshot & embed.
2. Browser terautentikasi -> draft data via Firestore Rules.
3. Cloudflare Worker -> authenticated privileged actions, Cloudinary signer, public API.
4. Firestore service account IAM -> bypass rules; risiko tertinggi jika bocor.
5. Cloudinary -> foto publik via URL/CDN; bukan repositori dokumen identitas.

## Risiko prioritas
| Ancaman | Dampak | Mitigasi | Pengujian |
|---|---|---|---|
| Self-role escalation | Ambil alih semua data | Role docs server-only, rules deny | T-023 |
| IDOR cross-kecamatan/cabang | Baca/update data lawan | Scope enforcement rules + Worker | T-002/T-003 |
| Fake official results | Klasemen palsu | Approval privileged server + audit | T-005/T-007 |
| Double approval/replay | Poin dobel | Idempotency & version preconditions | T-007/T-008 |
| Cloudinary secret leaked | Abuse/media quota | Worker secrets, rotation, signed only | T-016 |
| XSS rich-text | Credential/data theft | Strict sanitization, CSP, escaping | Test XSS corpus |
| PII in public API | Pelanggaran privasi | Public projection allowlist | T-014 |
| Unknown photo URL | Foto privat dapat diakses | No sensitive uploads, moderation, cleanup | T-022 |
| Quota exhaustion/bot traffic | Downtime publik | Cache, rate limiting, graceful degrade | T-017 |
| Worker service account compromise | Full DB tamper | Minimal IAM, key rotation, audit, secret scope | Pentest internal |
| Stale/offline dashboard marked LIVE | Informasi menyesatkan | Metadata time and stale banner | T-018 |
| Inconsistent rank update | Klasemen salah | Atomic pointer/version, deterministic recompute | T-008 |
| CSV injection exports | Formula execution | Escape leading =,+,-,@ and tabs | Unit CSV |

## Kontrol operasional
- Prinsip *four-eyes* untuk pengesahan dan manajemen peran bila SDM memungkinkan.
- Audit append-only pada privileged actions dengan request id, uid, event, object, old/new version, timestamp.
- Foto disaring terhadap data sensitif, editorial compliance.
- Pembatasan size/requests, validasi schema dan content type, log anomaly.
- Setiap insiden punya severity, pemilik, waktu deteksi, tindakan, status dan review setelah insiden.

## Catatan regulasi
UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi dan kebijakan pengendali data yang relevan perlu dikaji bersama panitia. Dokumen ini bukan nasihat hukum; default aplikasi harus minimisasi data anak dan PII.
