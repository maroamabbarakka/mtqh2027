import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicShell } from '@/layouts/PublicShell'
import { PublicHome } from '@/pages/PublicHome'
import { StandingsPage } from '@/pages/StandingsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { StatePanel } from '@/components/ui'

const AuthPages=lazy(()=>import('./AuthPages'))
const AdminRoutes=lazy(()=>import('./AdminRoutes'))
const fallback=<main className="center-page"><div className="auth-loader" aria-label="Memuat modul aman"><span/><p>Memuat modul aman…</p></div></main>

export default function App() {
  return <Routes>
    <Route element={<PublicShell/>}>
      <Route index element={<PublicHome/>}/>
      <Route path="klasemen" element={<StandingsPage/>}/>
      <Route path="jadwal" element={<PlaceholderPage title="Jadwal Lomba" description="Jadwal resmi belum diterbitkan. Halaman siap menerima data yang telah disahkan."/>}/>
      <Route path="berita" element={<PlaceholderPage title="Berita & Galeri" description="Publik hanya dapat melihat berita dan media yang telah melalui moderasi redaksi."/>}/>
      <Route path="tentang" element={<PlaceholderPage title="Tentang MTQH" description="Informasi penyelenggaraan akan dilengkapi setelah materi resmi diterima."/>}/>
    </Route>
    <Route path="login" element={<Suspense fallback={fallback}><AuthPages page="login"/></Suspense>}/>
    <Route path="lupa-password" element={<Suspense fallback={fallback}><AuthPages page="forgot"/></Suspense>}/>
    <Route path="akun-menunggu-aktivasi" element={<Suspense fallback={fallback}><AuthPages page="pending"/></Suspense>}/>
    <Route path="app/*" element={<Suspense fallback={fallback}><AdminRoutes/></Suspense>}/>
    <Route path="403" element={<main className="center-page"><StatePanel type="denied"/></main>}/>
    <Route path="*" element={<main className="center-page"><StatePanel type="empty"/></main>}/>
  </Routes>
}
