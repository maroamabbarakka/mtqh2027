import { CalendarDays, Download, Home, Menu, Newspaper, ShieldCheck, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { brandAssets } from '@/config/brand-assets'
import { Badge, Button } from '@/components/ui'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const nav = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/jadwal', label: 'Jadwal' },
  { to: '/klasemen', label: 'Klasemen' },
  { to: '/berita', label: 'Berita & Galeri' },
  { to: '/tentang', label: 'Tentang' },
]

export function PublicShell() {
  const [open, setOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.body.classList.toggle('nav-locked', open)
    window.addEventListener('keydown', close)
    return () => {
      document.body.classList.remove('nav-locked')
      window.removeEventListener('keydown', close)
    }
  }, [open])
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', capture)
    return () => window.removeEventListener('beforeinstallprompt', capture)
  }, [])

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main">Lewati ke konten utama</a>
      <header className="public-header">
        <div className="public-nav">
          <NavLink to="/" aria-label="Beranda MTQH Pinrang"><Brand /></NavLink>
          <nav id="public-navigation" className={open ? 'nav-open' : ''} aria-label="Navigasi utama">
            {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)}>{item.label}</NavLink>)}
            <NavLink to="/app/dashboard" onClick={() => setOpen(false)}><Button variant="secondary">Portal Panitia</Button></NavLink>
          </nav>
          <button className="menu-button" aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'} aria-controls="public-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        <div className="draft-strip" role="status"><Badge tone="warning">INFORMASI SEMENTARA</Badge><span>Tanggal lengkap, arena, dan aturan lomba menunggu keputusan panitia.</span></div>
      </header>
      {open && <button className="public-nav-backdrop" aria-label="Tutup navigasi" onClick={() => setOpen(false)} />}
      <main id="main" tabIndex={-1}><Outlet /></main>
      <footer className="public-footer">
        <div className="footer-main">
          <div className="footer-about"><Brand inverse /><p>Portal informasi dan administrasi MTQH XXXV Kabupaten Pinrang 2027.</p><span className="footer-status"><ShieldCheck size={16} /> Informasi resmi diterbitkan setelah verifikasi</span><div className="footer-logos" aria-label="Identitas kelembagaan"><img src={brandAssets.pinrangLogo} alt="Lambang Kabupaten Pinrang" /><img src={brandAssets.lptqLogo} alt="Lambang LPTQ Kabupaten Pinrang" /></div><small>Identitas kelembagaan Kabupaten Pinrang dan LPTQ.</small></div>
          <div className="footer-links">
            <div><h2>Jelajahi</h2>{nav.slice(0, 4).map((item) => <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>)}</div>
            <div><h2>Portal</h2><NavLink to="/tentang">Tentang portal</NavLink><NavLink to="/login">Masuk panitia</NavLink>{installPrompt && <button className="footer-install" onClick={() => void installApp()}><Download size={16} /> Pasang aplikasi</button>}</div>
            <div className="footer-readiness"><Badge tone="gold">STATUS PERSIAPAN</Badge><strong>Informasi diterbitkan bertahap</strong><p>Tanggal, arena, dan ketentuan resmi menunggu keputusan panitia.</p></div>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2027 MTQH Kabupaten Pinrang</span><span>Waktu ditampilkan dalam WITA · Data simulasi ditandai dengan jelas</span></div>
      </footer>
      <nav className="bottom-nav" aria-label="Navigasi seluler">
        <NavLink to="/" end><Home /><span>Beranda</span></NavLink>
        <NavLink to="/jadwal"><CalendarDays /><span>Jadwal</span></NavLink>
        <NavLink to="/klasemen"><Trophy /><span>Klasemen</span></NavLink>
        <NavLink to="/berita"><Newspaper /><span>Berita</span></NavLink>
      </nav>
    </div>
  )
}
