import { ArrowLeft, Clock3, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui'
export function PlaceholderPage({title,description,admin=false}:{title:string;description:string;admin?:boolean}){return <section className={`placeholder ${admin?'admin-placeholder':''}`}><Badge tone="warning">FITUR BERTAHAP</Badge><div className="placeholder-icon"><Clock3/></div><h1>{title}</h1><p>{description}</p><div className="safe-default"><ShieldCheck/><span>Fitur ini belum dibuka. Data resmi dan akses pengguna tetap terlindungi selama persiapan.</span></div><Link to={admin?'/app/dashboard':'/'}><ArrowLeft size={18}/> Kembali</Link></section>}
