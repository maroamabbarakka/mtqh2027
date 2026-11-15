import { brandAssets } from '@/config/brand-assets'

export function Brand({ compact=false, inverse=false }: { compact?: boolean; inverse?: boolean }) {
  return <div className={`brand ${inverse ? 'brand-inverse':''}`}><img src={brandAssets.mtqhLogo} alt="Logo MTQH XXXV Kabupaten Pinrang 2027"/><div>{!compact && <small>Portal Terpadu</small>}<strong>MTQH PINRANG</strong>{!compact && <span>Digital 2027</span>}</div></div>
}
