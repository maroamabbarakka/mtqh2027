import { Info, Medal, Trophy, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge, SectionTitle } from '@/components/ui'
import { standings } from '@/data/demo'

type Standing = (typeof standings)[number]

function DistrictDetail({ row, rank, onClose }: { row: Standing; rank: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', closeOnEscape)
    closeRef.current?.focus()
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', closeOnEscape)
      previous?.focus()
    }
  }, [onClose])
  return <div className="public-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="district-dialog" role="dialog" aria-modal="true" aria-labelledby="district-dialog-title">
      <header><div><Badge tone="warning">RINCIAN SIMULASI</Badge><h2 id="district-dialog-title">Kafilah {row.district}</h2><p>Peringkat sementara #{rank} pada contoh tampilan klasemen.</p></div><button ref={closeRef} className="dialog-close" onClick={onClose} aria-label="Tutup rincian kafilah"><X /></button></header>
      <div className="district-medals"><article><Medal /><span>Emas</span><strong>{row.gold}</strong></article><article><Medal /><span>Perak</span><strong>{row.silver}</strong></article><article><Medal /><span>Perunggu</span><strong>{row.bronze}</strong></article></div>
      <dl className="district-facts"><div><dt><Users /> Peserta contoh</dt><dd>{row.participants}</dd></div><div><dt><Trophy /> Total medali</dt><dd>{row.gold + row.silver + row.bronze}</dd></div></dl>
      <div className="district-branches"><h3>Pratinjau perolehan per cabang</h3>{row.highlights.map((item) => <div key={item.branch}><span>{item.branch}</span><strong>{item.medal}</strong></div>)}</div>
      <div className="dialog-note"><Info /><span>Seluruh angka dan rincian ini adalah data simulasi. Poin dan penentu juara umum belum disahkan.</span></div>
    </section>
  </div>
}

export function StandingsPage() {
  const [selected, setSelected] = useState<{ row: Standing; rank: number } | null>(null)
  return <div className="page-wrap standings-page">
    <div className="page-heading"><Badge tone="warning">DATA SIMULASI</Badge><h1>Klasemen MTQH</h1><p>Belum ada hasil resmi. Pilih nama kafilah untuk melihat contoh rincian perolehan.</p></div>
    <div className="method-note"><Info/><span>Kebijakan poin dan penentu juara umum <strong>belum disahkan</strong>. Klasemen publik tidak akan berubah sebelum hasil disahkan.</span></div>
    <section className="surface"><SectionTitle eyebrow="Pratinjau" title="Klasemen medali" action={<Badge tone="neutral">Diperbarui — belum tersedia</Badge>}/><div className="table-scroll"><table><thead><tr><th>Peringkat</th><th>Kafilah</th><th><Medal size={16}/> Emas</th><th>Perak</th><th>Perunggu</th><th><Trophy size={16}/> Poin</th></tr></thead><tbody>{standings.map((row, index) => <tr key={row.district}><td><span className="rank">{index + 1}</span></td><td><button className="district-detail-trigger" onClick={() => setSelected({ row, rank: index + 1 })}>{row.district}<span>Lihat rincian</span></button></td><td>{row.gold}</td><td>{row.silver}</td><td>{row.bronze}</td><td>—</td></tr>)}</tbody></table></div></section>
    {selected && <DistrictDetail row={selected.row} rank={selected.rank} onClose={() => setSelected(null)} />}
  </div>
}
