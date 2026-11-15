# 29 — Final Release Checklist (harus sign-off)

## Keputusan dan sumber data
- [ ] Nama resmi MTQH XXXV Kab. Pinrang, tanggal, lokasi, identitas/logo disetujui panitia.
- [ ] Cabang/golongan/kuota/usia dipasang dari dokumen keputusan.
- [ ] Skema poin, ranking/tie-break, juara harapan, hadiah beregu disahkan.
- [ ] Privacy notice, retensi data peserta, izin foto anak & daftar data publik disetujui.

## Spark dan biaya
- [ ] Firebase project masih **Spark** dan tidak ditautkan ke Cloud Billing.
- [ ] Repo tidak menggunakan Functions, Cloud Storage, App Hosting, Phone SMS OTP.
- [ ] Cloudinary Free + Cloudflare Workers Free diverifikasi dan usage monitoring.
- [ ] Load test dan estimasi read/write/CPU/transfer dilampirkan.
- [ ] Fallback ketika limit habis diuji dan tidak menawarkan upgrade.

## Keamanan
- [ ] Self-assigned roles ditolak; super admin bootstrap aman.
- [ ] All RBAC scope negative tests lolos.
- [ ] No PII di publicEvents/API/galeri.
- [ ] Approval/publish idempotent, server-authorized, audit recorded.
- [ ] Cloudinary/Firebase IAM secret tidak berada di git, frontend, screenshot, browser console.
- [ ] Sanitizer XSS, content-type guard, CORS, CSP, anti-frame admin lulus.
- [x] Hosting mengirim CSP, anti-frame, nosniff, referrer policy, dan permissions policy untuk build uji coba.
- [x] Rules emulator pendaftaran menolak create lintas kecamatan dan write role yang tidak berhak (fase REG-102 lokal).

## Mutu visual dan fungsi
- [ ] Dashboard desktop cocok arahan mockup tanpa fitur e-scoring atau data 2025.
- [ ] Public website desktop dan mobile responsif di 360,390,768,1024,1440.
- [ ] Footer/hero/data menggunakan informasi benar; semua dummy jelas `SIMULASI` atau sudah dibersihkan.
- [ ] Laporan dan ekspor bekerja sesuai izin.
- [ ] Kontributor dapat kirim foto+berita; redaksi review; publik hanya published.
- [ ] API/iframe dicoba di domain eksternal dan layar videotron 16:9.
- [ ] Accessibility WCAG 2.2 AA flow kritis; basic SEO SPA disclosure.

## Operasional
- [ ] Pengguna panitia dilatih dan uji peran selesai.
- [ ] Backup manual terenkripsi + restore test ada.
- [ ] Runbook, PIC insiden, dan jalur koreksi juara disepakati.
- [ ] Pemilik produk menerima UAT; catatan sign-off disimpan terpisah.

**Peraturan rilis:** Jika butir identitas/hasil resmi, keamanan role, atau biaya Spark belum lulus, **jangan produksi**.
