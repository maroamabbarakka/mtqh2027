# Codex Phase 05 — Media Center dan Berita Panitia

## Baca
`docs/13-CMS-EDITORIAL.md`, `docs/14-MEDIA-BACKEND.md`, `docs/24-A11Y-SEO.md`.

## Implementasi
1. Editor narasi & berita: title, lead, body, metadata cabang/kafilah, tanggal kejadian, galeri.
2. News status draft/submitted/review/needs_revision/published; editorial queue dan notes.
3. Cloudinary signed uploads melalui Worker verified session, browser compression, remove GPS metadata, file type/size restrictions, queue progress.
4. Worker register image metadata + allowlist Cloudinary public IDs, ownership + audit.
5. Publish sanitized approved article ke public projection; public article routes & photo gallery.
6. Templates caption WA/FB/IG berbasis teks; tanpa AI API berbayar.
7. Moderation tests, XSS injection, invalid photo format, contributor trying publish, quota depleted states.

## Acceptance
- Admin cabang ber-role contributor dapat menulis berita dan upload 3 foto.
- Editor memeriksa lalu publish; draft tidak terlihat publik.
- Secret tidak muncul di frontend atau repo; foto berisi identitas sensitif ditolak oleh kebijakan dan moderasi.
- Saat Cloudinary limit, kiriman teks dapat tetap disimpan dan foto ditunda tanpa prompt upgrade.
