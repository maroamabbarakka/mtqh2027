import { CalendarDays, Home, Menu, Newspaper, Trophy } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { brandAssets } from '@/config/brand-assets'
import { Badge, Button } from '@/components/ui'

const nav = [{to:'/',label:'Beranda',end:true},{to:'/jadwal',label:'Jadwal'},{to:'/klasemen',label:'Klasemen'},{to:'/berita',label:'Berita & Galeri'},{to:'/tentang',label:'Tentang'}]
export function PublicShell() {
  const [open,setOpen]=useState(false)
  return <div className="public-shell"><a className="skip-link" href="#main">Lewati ke konten utama</a><header className="public-header"><div className="public-nav"><NavLink to="/" aria-label="Beranda"><Brand/></NavLink><nav className={open?'nav-open':''} aria-label="Navigasi utama">{nav.map(item=><NavLink key={item.to} to={item.to} end={item.end} onClick={()=>setOpen(false)}>{item.label}</NavLink>)}<NavLink to="/app/dashboard"><Button variant="secondary">Portal Panitia</Button></NavLink></nav><button className="menu-button" aria-label="Buka navigasi" aria-expanded={open} onClick={()=>setOpen(!open)}><Menu/></button></div><div className="draft-strip"><Badge tone="warning">INFORMASI SEMENTARA</Badge><span>Tanggal lengkap, venue, dan aturan lomba menunggu keputusan panitia.</span></div></header><main id="main"><Outlet/></main><footer className="public-footer"><div><Brand inverse/><p>Portal informasi dan administrasi MTQH XXXV Kabupaten Pinrang 2027.</p></div><div><h3>Tautan cepat</h3><NavLink to="/jadwal">Jadwal</NavLink><NavLink to="/klasemen">Klasemen</NavLink><NavLink to="/berita">Berita</NavLink></div><div><h3>Identitas pendukung</h3><div className="footer-logos"><img src={brandAssets.pinrangLogo} alt="Lambang Kabupaten Pinrang"/><img src={brandAssets.lptqLogo} alt="Lambang LPTQ Kabupaten Pinrang"/></div><small>Aset menunggu verifikasi panitia</small></div></footer><nav className="bottom-nav" aria-label="Navigasi seluler"><NavLink to="/"><Home/><span>Beranda</span></NavLink><NavLink to="/jadwal"><CalendarDays/><span>Jadwal</span></NavLink><NavLink to="/klasemen"><Trophy/><span>Klasemen</span></NavLink><NavLink to="/berita"><Newspaper/><span>Berita</span></NavLink></nav></div>
}
