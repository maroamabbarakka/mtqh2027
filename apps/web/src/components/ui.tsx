import type { ComponentType, ReactNode } from 'react'
import { AlertCircle, CloudOff, LockKeyhole, RefreshCw } from 'lucide-react'

export function Badge({ children, tone='neutral' }: { children: ReactNode; tone?: 'neutral'|'success'|'warning'|'gold' }) { return <span className={`badge badge-${tone}`}>{children}</span> }
export function Button({ children, variant='primary', className='', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }) { return <button className={`button button-${variant} ${className}`} {...props}>{children}</button> }
export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) { return <div className="section-title"><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>{action}</div> }
export function StatCard({ icon: Icon, label, value, note, tone='green' }: { icon: ComponentType<{size?: number}>; label: string; value: string; note: string; tone?: string }) { return <article className={`stat-card tone-${tone}`}><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article> }
export function StatePanel({ type }: { type: 'empty'|'error'|'offline'|'denied' }) {
  const state = { empty: { Icon: AlertCircle, title:'Belum ada data', text:'Data akan tampil setelah tersedia dan disahkan.' }, error:{ Icon: AlertCircle,title:'Data belum dapat dimuat',text:'Coba kembali. Detail teknis tidak ditampilkan demi keamanan.'}, offline:{Icon:CloudOff,title:'Anda sedang offline',text:'Data terakhir tetap tersedia. Aksi sensitif dinonaktifkan.'}, denied:{Icon:LockKeyhole,title:'Akses tidak diizinkan',text:'Akun ini tidak memiliki izin untuk melihat halaman tersebut.'} }[type]
  return <div className="state-panel"><state.Icon size={28}/><h2>{state.title}</h2><p>{state.text}</p>{type==='error' && <Button variant="secondary"><RefreshCw size={17}/> Coba lagi</Button>}</div>
}
