import { describe, expect, it } from 'vitest'
import { districts, event, standings } from '@/data/demo'

describe('konfigurasi demonstrasi', () => {
  it('memuat tepat 12 kecamatan unik', () => {
    expect(districts).toHaveLength(12)
    expect(new Set(districts).size).toBe(12)
  })

  it('menandai status acara dan klasemen sebagai belum resmi', () => {
    expect(event.status).toContain('belum disahkan')
    expect(event.dateLabel).toContain('menunggu keputusan')
    expect(standings.every((row) => row.points === 0)).toBe(true)
  })
})
