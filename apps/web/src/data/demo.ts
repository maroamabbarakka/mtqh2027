export const districts = ['Batulappa','Cempa','Duampanua','Lanrisang','Lembang','Mattiro Bulu','Mattiro Sompe','Paleteang','Patampanua','Suppa','Tiroang','Watang Sawitto'] as const
export const branchData = [
  { name: 'Tilawah', value: 72 }, { name: 'Tahfiz', value: 58 }, { name: 'Tafsir', value: 42 },
  { name: 'Fahmil', value: 36 }, { name: 'Syarhil', value: 32 }, { name: 'KTIQ', value: 24 },
]
const branchHighlights = ['Tilawah', 'Tahfiz', 'Tafsir', 'Fahmil Qur’an', 'Syarhil Qur’an', 'KTIQ']
export const standings = districts.slice(0, 6).map((district, index) => ({
  district,
  gold: Math.max(0, 6 - index),
  silver: Math.max(0, 4 - index),
  bronze: Math.max(0, 3 - Math.floor(index / 2)),
  points: 0,
  participants: 18 + index * 3,
  highlights: branchHighlights.slice(0, 3).map((branch, branchIndex) => ({ branch, medal: ['Emas', 'Perak', 'Perunggu'][(branchIndex + index) % 3] })),
}))
export const event = { id: 'mtqh-pinrang-2027', name: 'MTQH XXXV Kabupaten Pinrang 2027', host: 'Kecamatan Tiroang', dateLabel: 'Januari 2027 · tanggal menunggu keputusan', timezone: 'WITA', status: 'Persiapan · belum disahkan' } as const
