import { ArrowLeft, CalendarDays, Clock3, Share2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { publicNews } from '@/data/public-news'

export function NewsDetailPage() {
  const { slug } = useParams()
  const article = publicNews.find((item) => item.slug === slug)
  if (!article) return <Navigate to="/berita" replace />
  return <article className="news-detail page-wrap">
    <Link className="news-back" to="/berita"><ArrowLeft /> Kembali ke berita</Link>
    <header>
      <Badge tone="warning">ARTIKEL SIMULASI · {article.category.toUpperCase()}</Badge>
      <h1>{article.title}</h1>
      <p>{article.excerpt}</p>
      <div className="news-meta"><span><CalendarDays />{article.publishedLabel}</span><span><Clock3 />{article.readTime}</span><span><Share2 />Penulis Simulasi</span></div>
    </header>
    <figure><img src={article.cover} alt={article.coverAlt} /><figcaption>Ilustrasi visual untuk konten simulasi, bukan dokumentasi kegiatan resmi.</figcaption></figure>
    <div className="news-article-copy">{article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<aside><strong>Perhatian</strong>Isi artikel ini dibuat untuk pengujian tampilan. Informasi resmi hanya berlaku setelah diterbitkan dan disahkan panitia.</aside></div>
  </article>
}
