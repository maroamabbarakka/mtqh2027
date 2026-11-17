import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Medal,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { brandAssets } from "@/config/brand-assets";
import { Badge, Button, SectionTitle } from "@/components/ui";
import { event } from "@/data/demo";
import { publicNews } from "@/data/public-news";

const BranchChart = lazy(() => import("@/components/BranchChart"));

export function PublicHome() {
  return (
    <>
      <section className="hero">
        <div className="hero-pattern" />
        <div className="hero-content">
          <div className="hero-copy">
            <Badge tone="gold">MTQH XXXV · KABUPATEN PINRANG</Badge>
            <h1>
              Merawat syiar,
              <br />
              <em>menghubungkan informasi.</em>
            </h1>
            <p>
              Portal terpadu untuk informasi kegiatan, jadwal, hasil resmi,
              berita, dan galeri MTQH Kabupaten Pinrang.
            </p>
            <div className="hero-meta">
              <span>
                <CalendarDays /> {event.dateLabel}
              </span>
              <span>
                <MapPin /> {event.host}
              </span>
            </div>
            <div className="hero-actions">
              <Link to="/jadwal">
                <Button>
                  Jelajahi jadwal <ArrowRight />
                </Button>
              </Link>
              <Link to="/klasemen">
                <Button variant="secondary">Lihat klasemen</Button>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="logo-halo" />
            <img
              src={brandAssets.mtqhLogo}
              alt="Logo MTQH XXXV Kabupaten Pinrang 2027"
            />
            <div className="hero-float">
              <ShieldCheck />
              <div>
                <strong>Informasi terverifikasi</strong>
                <span>Publikasi melalui proses moderasi</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="quick-links">
        <Link to="/jadwal">
          <CalendarDays />
          <div>
            <strong>Jadwal Lomba</strong>
            <span>Agenda terpublikasi</span>
          </div>
          <ArrowRight />
        </Link>
        <Link to="/klasemen">
          <Trophy />
          <div>
            <strong>Hasil Lomba</strong>
            <span>Hanya yang disahkan</span>
          </div>
          <ArrowRight />
        </Link>
        <Link to="/berita">
          <Newspaper />
          <div>
            <strong>Berita & Galeri</strong>
            <span>Dokumentasi kegiatan</span>
          </div>
          <ArrowRight />
        </Link>
      </section>
      <section className="page-wrap overview">
        <SectionTitle
          eyebrow="Satu portal, informasi terpercaya"
          title="Persiapan MTQH dalam satu pandangan"
        />
        <div className="public-stat-grid">
          <article>
            <span>
              <Users /> Kafilah
            </span>
            <strong>12</strong>
            <small>Kecamatan Kabupaten Pinrang</small>
          </article>
          <article>
            <span>
              <Medal /> Hasil resmi
            </span>
            <strong>—</strong>
            <small>Belum ada hasil disahkan</small>
          </article>
          <article>
            <span>
              <Clock3 /> Status
            </span>
            <strong>Persiapan</strong>
            <small>Informasi resmi diterbitkan bertahap</small>
          </article>
        </div>
        <div className="overview-grid">
          <article className="surface chart-card">
            <SectionTitle
              eyebrow="Data simulasi"
              title="Pratinjau peserta per cabang"
            />
            <div className="chart-wrap">
              <Suspense
                fallback={<div className="chart-wrap chart-skeleton" aria-label="Memuat grafik" />}
              >
                <BranchChart />
              </Suspense>
            </div>
          </article>
          <article className="surface status-card">
            <span className="ornament">
              <Sparkles />
            </span>
            <Badge tone="warning">PERSIAPAN</Badge>
            <h2>Informasi resmi diterbitkan bertahap</h2>
            <p>
              Tanggal lengkap, arena, cabang, golongan, dan aturan klasemen
              masih menunggu pengesahan.
            </p>
            <ul>
              <li>
                <ShieldCheck /> Data privat peserta tidak ditampilkan
              </li>
              <li>
                <ShieldCheck /> Hasil hanya tampil setelah disahkan
              </li>
              <li>
                <ShieldCheck /> Semua waktu menggunakan WITA
              </li>
            </ul>
          </article>
        </div>
      </section>
      <section className="news-section">
        <div className="page-wrap">
          <SectionTitle
            eyebrow="Ruang informasi"
            title="Berita & pengumuman"
            action={
              <Link to="/berita">
                Lihat semua <ArrowRight />
              </Link>
            }
          />
          <div className="home-news-grid">
            {publicNews.slice(0, 3).map((article) => <article className="home-news-card" key={article.slug}>
              <Link className="home-news-cover" to={`/berita/${article.slug}`}><img src={article.cover} alt={article.coverAlt} /></Link>
              <div><Badge tone="warning">SIMULASI · {article.category.toUpperCase()}</Badge><h3><Link to={`/berita/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p><Link className="news-read" to={`/berita/${article.slug}`}>Baca artikel <ArrowRight /></Link></div>
            </article>)}
          </div>
        </div>
      </section>
    </>
  );
}
