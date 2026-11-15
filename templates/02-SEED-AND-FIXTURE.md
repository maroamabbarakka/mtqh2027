# Seed Data dan Fixture Uji (Nonresmi)

## Identitas event
```json
{
  "id": "mtqh-pinrang-2027",
  "name": "MTQH XXXV Kabupaten Pinrang 2027",
  "year": 2027,
  "plannedMonth": "2027-01",
  "hostDistrictId": "tiroang",
  "exactStartDate": null,
  "exactEndDate": null,
  "timezone": "Asia/Makassar",
  "stage": "preparation",
  "officialRulesStatus": "awaiting_decision",
  "isSimulation": true
}
```

## 12 kecamatan
```json
[
  "Batulappa", "Cempa", "Duampanua", "Lanrisang", "Lembang",
  "Mattiro Bulu", "Mattiro Sompe", "Paleteang", "Patampanua",
  "Suppa", "Tiroang", "Watang Sawitto"
]
```

## Cabang referensi (bukan final)
```json
[
  {"id":"tilawah","name":"Seni Baca Al-Qur'an","status":"draft"},
  {"id":"qiraat","name":"Qira'at Al-Qur'an","status":"draft"},
  {"id":"tahfiz","name":"Hafalan Al-Qur'an","status":"draft"},
  {"id":"tafsir","name":"Tafsir Al-Qur'an","status":"draft"},
  {"id":"fahmil","name":"Fahmil Qur'an","status":"draft"},
  {"id":"syarhil","name":"Syarhil Qur'an","status":"draft"},
  {"id":"kaligrafi","name":"Seni Kaligrafi Al-Qur'an","status":"draft"},
  {"id":"ktiq","name":"Karya Tulis Ilmiah Al-Qur'an","status":"draft"}
]
```

## Contoh pemenang simulasi
Semua yang tampil pada dashboard fixture diberi badge `SIMULASI`; nama `Peserta Contoh 01`, `Regu Contoh 01`. Jangan memasukkan nama atlet/juara MTQ lain sebagai hasil 2027. Jarak hasil dan kuota dibuat beragam agar chart realistis, tetapi semua ringkasan wajib dihitung dari fixtures bukan manual ketik di JSX.
