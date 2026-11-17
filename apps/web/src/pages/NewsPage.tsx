import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { publicNews } from '@/data/public-news'

export function NewsPage() {
  return <div className="news-page">
    <header className="page-heading news-heading">
      <Badge tone="warning">KONTEN SIMULASI</Badge>
      <h1>Berita & pengumuman</h1>
      <p>Contoh penyajian informasi kegiatan. Seluruh artikel di bawah belum merupakan pengumuman resmi panitia.</p>
    </header>
    <div className="page-wrap">
      <div className="simulation-notice" role="note"><strong>Mudah dibersihkan sebelum produksi</strong><span>Artikel dan sampul simulasi tersimpan terpisah dari data resmi dan tidak memuat data pribadi peserta.</span></div>
      <section className="news-grid" aria-label="Daftar berita simulasi">
        {publicNews.map((article, index) => <article className={index === 0 ? 'news-card news-card-featured' : 'news-card'} key={article.slug}>
          <Link className="news-cover" to={`/berita/${article.slug}`} aria-label={`Baca ${article.title}`}><img src={article.cover} alt={article.coverAlt} /></Link>
          <div className="news-card-body">
            <Badge tone="warning">SIMULASI · {article.category.toUpperCase()}</Badge>
            <h2><Link to={`/berita/${article.slug}`}>{article.title}</Link></h2>
            <p>{article.excerpt}</p>
            <div className="news-meta"><span><CalendarDays />{article.publishedLabel}</span><span><Clock3 />{article.readTime}</span></div>
            <Link className="news-read" to={`/berita/${article.slug}`}>Baca selengkapnya <ArrowRight /></Link>
          </div>
        </article>)}
      </section>
    </div>
  </div>
}
