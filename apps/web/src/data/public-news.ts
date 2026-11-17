import preparationCover from '@/assets/news/persiapan-mtqh-simulasi.webp'
import coordinationCover from '@/assets/news/koordinasi-panitia-simulasi.webp'
import venueCover from '@/assets/news/arena-kegiatan-simulasi.webp'

export type PublicNewsArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  publishedLabel: string
  readTime: string
  cover: string
  coverAlt: string
  content: string[]
}

// Seluruh entri di modul ini adalah simulasi terisolasi agar mudah dihapus sebelum produksi.
export const publicNews: PublicNewsArticle[] = [
  {
    slug: 'persiapan-informasi-mtqh-dilakukan-bertahap',
    title: 'Persiapan informasi MTQH dilakukan secara bertahap',
    excerpt: 'Panitia menyiapkan alur informasi yang terpusat agar jadwal, pengumuman, dan hasil yang telah disahkan mudah diakses masyarakat.',
    category: 'Persiapan',
    publishedLabel: '17 November 2026',
    readTime: '3 menit baca',
    cover: preparationCover,
    coverAlt: 'Al-Qur’an terbuka di atas rehal dalam interior masjid bernuansa hijau',
    content: [
      'Portal MTQH Pinrang disiapkan sebagai pusat informasi kegiatan yang dapat dibuka melalui komputer maupun telepon seluler. Informasi akan diterbitkan secara bertahap setelah melalui pemeriksaan panitia.',
      'Tanggal lengkap, lokasi, cabang, golongan, dan ketentuan kegiatan pada artikel simulasi ini belum merupakan keputusan resmi. Masyarakat disarankan selalu memeriksa penanda status pada setiap halaman.',
      'Ketika materi resmi tersedia, redaksi akan mengganti konten simulasi melalui proses moderasi sehingga informasi publik tetap jelas, tertelusur, dan tidak bercampur dengan data administrasi peserta.',
    ],
  },
  {
    slug: 'koordinasi-layanan-informasi-kafilah',
    title: 'Koordinasi layanan informasi kafilah mulai disiapkan',
    excerpt: 'Alur administrasi dirancang untuk membantu perwakilan kecamatan melengkapi data dan memantau status pemeriksaan secara aman.',
    category: 'Kafilah',
    publishedLabel: '15 November 2026',
    readTime: '3 menit baca',
    cover: coordinationCover,
    coverAlt: 'Panitia menyiapkan map, kartu identitas kosong, dan perlengkapan administrasi',
    content: [
      'Setiap kecamatan nantinya memperoleh jalur administrasi sesuai kewenangan masing-masing. Data pribadi peserta tidak ditampilkan pada portal publik dan hanya dapat dilihat oleh petugas yang memang memerlukannya.',
      'Status berkas dirancang menggunakan bahasa yang mudah dipahami. Apabila ada bagian yang perlu diperbaiki, pengelola kafilah dapat melihat catatan pemeriksaan tanpa membuka data milik kecamatan lain.',
      'Nama, jadwal, dan angka pada artikel ini hanya contoh tampilan. Penggunaan data nyata menunggu penetapan panitia dan persetujuan kebijakan perlindungan data.',
    ],
  },
  {
    slug: 'peninjauan-kesiapan-ruang-kegiatan',
    title: 'Peninjauan kesiapan ruang kegiatan dilakukan menyeluruh',
    excerpt: 'Kebutuhan akses pengunjung, alur peserta, area informasi, dan kenyamanan ruang menjadi bagian dari daftar persiapan kegiatan.',
    category: 'Arena',
    publishedLabel: '12 November 2026',
    readTime: '2 menit baca',
    cover: venueCover,
    coverAlt: 'Ruang kegiatan bernuansa hijau dan emas dengan susunan kursi yang rapi',
    content: [
      'Gambaran ruang pada sampul merupakan ilustrasi simulasi dan bukan dokumentasi lokasi resmi. Lokasi kegiatan belum dicantumkan sampai keputusan panitia diterbitkan.',
      'Peninjauan nantinya mencakup akses masuk dan keluar, titik informasi, kebutuhan perangkat, serta kenyamanan peserta dan pengunjung. Jadwal penggunaan ruang juga akan diselaraskan agar tidak tumpang tindih.',
      'Setiap perubahan yang telah disahkan akan ditampilkan pada halaman jadwal dengan waktu WITA dan penanda pembaruan yang jelas.',
    ],
  },
]
