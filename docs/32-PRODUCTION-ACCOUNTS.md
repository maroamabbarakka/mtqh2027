# Akun Operasional Produksi

## Status

Pada 17 November 2026 telah dibuat 26 akun operasional pada Firebase Authentication proyek `mtqhpinrang2027`. Setiap akun memiliki profil privat, assignment role event-scoped, scope kecamatan/cabang minimal, kewajiban mengganti kata sandi setelah login pertama, dan catatan provisioning pada audit administrasi.

Kata sandi sementara tidak dicatat dalam repository. Distribusikan melalui jalur privat dan minta setiap pemilik segera menggantinya melalui menu **Keamanan Akun**. Setelah diganti, kata sandi tidak dapat dilihat kembali oleh panitia atau administrator.

## Panitia pusat

| Akun | Peran |
|---|---|
| `superadmin@mtqhpinrang2027.id` | Super Admin |
| `admin.event@mtqhpinrang2027.id` | Admin Event |
| `pengawas@mtqhpinrang2027.id` | Pengawas |
| `verifikator@mtqhpinrang2027.id` | Verifikator |
| `editor@mtqhpinrang2027.id` | Editor |
| `kontributor@mtqhpinrang2027.id` | Kontributor |

## Admin kafilah

| Akun | Kecamatan |
|---|---|
| `kafilah.batulappa@mtqhpinrang2027.id` | Batulappa |
| `kafilah.cempa@mtqhpinrang2027.id` | Cempa |
| `kafilah.duampanua@mtqhpinrang2027.id` | Duampanua |
| `kafilah.lanrisang@mtqhpinrang2027.id` | Lanrisang |
| `kafilah.lembang@mtqhpinrang2027.id` | Lembang |
| `kafilah.mattiro-bulu@mtqhpinrang2027.id` | Mattiro Bulu |
| `kafilah.mattiro-sompe@mtqhpinrang2027.id` | Mattiro Sompe |
| `kafilah.paleteang@mtqhpinrang2027.id` | Paleteang |
| `kafilah.patampanua@mtqhpinrang2027.id` | Patampanua |
| `kafilah.suppa@mtqhpinrang2027.id` | Suppa |
| `kafilah.tiroang@mtqhpinrang2027.id` | Tiroang |
| `kafilah.watang-sawitto@mtqhpinrang2027.id` | Watang Sawitto |

## Admin cabang lomba

| Akun | Cabang |
|---|---|
| `cabang.tilawah@mtqhpinrang2027.id` | Tilawah |
| `cabang.qiraat@mtqhpinrang2027.id` | Qiraat |
| `cabang.tahfiz@mtqhpinrang2027.id` | Tahfiz |
| `cabang.tafsir@mtqhpinrang2027.id` | Tafsir |
| `cabang.fahmil@mtqhpinrang2027.id` | Fahmil |
| `cabang.syarhil@mtqhpinrang2027.id` | Syarhil |
| `cabang.khat@mtqhpinrang2027.id` | Kaligrafi |
| `cabang.karya-tulis-ilmiah-al-quran@mtqhpinrang2027.id` | Karya Tulis Ilmiah Al-Qur'an |

## Ketentuan operasional

1. Akun adalah akun personal operasional; jangan digunakan bersama oleh beberapa petugas setelah penanggung jawab ditetapkan.
2. Login pertama diarahkan ke **Keamanan Akun** hingga kata sandi sementara diganti.
3. Profil dapat dilengkapi sendiri, tetapi role dan scope tidak dapat diubah pengguna.
4. Admin kafilah hanya mengelola kecamatan yang ditugaskan.
5. Admin cabang hanya mengelola hasil cabang yang ditugaskan dan tidak dapat mengesahkan pengajuannya sendiri.
6. Email berpola domain operasional berfungsi sebagai username. Pemulihan melalui email baru dapat diandalkan setelah alamat tersebut mempunyai kotak masuk nyata atau diganti dengan email petugas yang aktif.
7. Bila penanggung jawab berubah, nonaktifkan akun lama, buat akun personal baru, dan catat perubahan assignment dalam audit.

## Provisioning ulang

Skrip `scripts/provision-production-users.mjs` memakai konfirmasi target, service account tepercaya, dan variabel lingkungan untuk rahasia sementara. Skrip tidak menyimpan password atau private key ke Git. Akun yang sudah ditemukan melalui indeks profil tidak di-reset passwordnya secara otomatis.
