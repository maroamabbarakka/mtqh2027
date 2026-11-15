# 13 — News & Media Center: Berita, Narasi, Foto, Galeri

## Tujuan
Setiap pengguna panitia yang memiliki `contributor` boleh mengirim liputan acara (judul, narasi, foto, caption, waktu, tempat, cabang, kecamatan terkait). Redaksi mengontrol kualitas faktual dan keamanan sebelum konten tampil publik.

## Content types
`news` (berita), `field_report` (laporan cabang), `announcement` (pengumuman), `photo_story` (galeri naratif), `profile` (profil peserta, memerlukan izin publikasi). Video embedding hanya URL yang disetujui; **jangan bangun video hosting di Cloudinary Free pada MVP**.

## Schema artikel
```json
{
  "eventId": "mtqh-pinrang-2027", "type": "news", "title": "Judul draft",
  "slug": "judul-draft", "lead": "Paragraf pembuka", "bodyHtmlSanitized": "<p>...</p>",
  "tags": [], "branchId": "tilawah", "districtIds": ["tiroang"],
  "venueId": null, "occurredAt": null, "coverMediaId": null,
  "galleryMediaIds": [], "authorUid": "uid", "editorUid": null,
  "status": "draft", "reviewNotes": [], "revision": 1,
  "publishedAt": null, "seoTitle": null, "seoDescription": null
}
```

## Editor UX
- Form langkah ringkas: Info berita, Naskah, Foto, Preview, Kirim.
- Field wajib untuk submit: judul (10–140 karakter), lead (50–350), isi (sesuai ketentuan), tanggal kejadian bila ada, sumber/fakta, minimal caption untuk foto utama.
- Rich-text minimal dan aman: heading, bold, italic, list, link; **sanitize HTML** sebelum simpan dan render.
- Foto: browser compression (contoh target max 1600 px / 500 KB), multi-file queue, retry, progress, alt text & kredit.
- Draft auto-save dengan debounce hanya jika koneksi stabil; tampilkan status "tersimpan" atau "belum tersinkron".
- Review queue: `submitted`, `in_review`, `changes_requested`, `approved`, `published`. Editor bisa assign diri, edit, return with notes.
- Berita published disalin ke `publicEvents/.../articles` melalui backend privileged, dengan field whitelist.

## Pedoman editorial
- Berita menggunakan 5W+1H secara substantif, **bukan menampilkan label 5W+1H pada artikel**.
- Jangan mengganti/menambah pernyataan pejabat, jumlah peserta, lokasi, nama pemenang tanpa sumber sah.
- Nama dan foto peserta anak memerlukan kebijakan persetujuan dan kepentingan yang jelas.
- Foto orisinal, tidak mengubah identitas wajah, tidak merekayasa kemenangan/fakta.
- Kredit foto, caption, waktu kejadian, kontributor tersimpan; redaktur dapat menyunting tanpa menghapus jejak sumber.
- Artikel publik memuat editor, tanggal publikasi, waktu pembaruan, dan tautan koreksi bila relevan.

## Moderasi media
- Asset upload berada di Cloudinary dan URL berpotensi diakses bila diketahui; **jangan pernah unggah dokumen identitas/PII**.
- Hanya asset `approved` dapat ditautkan ke `publicEvents`.
- File berisi konten ilegal/tidak pantas harus bisa ditolak, disembunyikan, dan dihapus oleh pemilik akun Cloudinary via jalur aman; cache CDN bisa tetap ada sampai invalidasi.
- Hindari menyimpan user location metadata EXIF; strip GPS EXIF di client.
- Tindakan redaksi diaudit: siapa, kapan, perubahan, alasan.

## SEO & distribusi
URL `/berita/:slug`, OpenGraph bila prerender per artikel dimungkinkan dalam limit Spark; jika tidak, prioritaskan konten ramah manusia dan gunakan fallback umum, dokumentasikan limit SPA. Tombol share via Web Share API/copy URL. Caption WA/FB/IG dibuat dari template editorial, **bukan AI berbayar**.
