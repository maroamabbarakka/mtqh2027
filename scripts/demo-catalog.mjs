const division = (id, branchId, name, gender, teamMode = "individual") => ({ id, branchId, name, gender, teamMode });
const paired = (branchId, baseId, name, teamMode = "individual") => [
  division(`${baseId}-putra`, branchId, `${name} Putra`, "putra", teamMode),
  division(`${baseId}-putri`, branchId, `${name} Putri`, "putri", teamMode),
];

export const demoDivisions = [
  division("contoh-tilawah-putra", "tilawah", "Tilawah Dewasa Putra", "putra"),
  division("contoh-tilawah-putri", "tilawah", "Tilawah Dewasa Putri", "putri"),
  ...paired("tilawah", "tartil-anak", "Tartil Anak"),
  ...paired("tilawah", "tilawah-anak", "Tilawah Anak"),
  ...paired("tilawah", "tilawah-remaja", "Tilawah Remaja"),
  ...paired("tilawah", "tilawah-disabilitas-netra", "Tilawah Disabilitas Netra"),
  ...paired("qiraat", "qiraat-murattal-remaja", "Qiraat Murattal Remaja"),
  ...paired("qiraat", "qiraat-murattal-dewasa", "Qiraat Murattal Dewasa"),
  ...paired("qiraat", "qiraat-mujawwad-dewasa", "Qiraat Mujawwad Dewasa"),
  ...paired("tahfiz", "tahfiz-1-juz-tilawah", "Tahfiz 1 Juz dan Tilawah"),
  ...paired("tahfiz", "tahfiz-5-juz-tilawah", "Tahfiz 5 Juz dan Tilawah"),
  ...paired("tahfiz", "tahfiz-10-juz", "Tahfiz 10 Juz"),
  ...paired("tahfiz", "tahfiz-20-juz", "Tahfiz 20 Juz"),
  ...paired("tahfiz", "tahfiz-30-juz", "Tahfiz 30 Juz"),
  ...paired("tafsir", "tafsir-arab", "Tafsir Bahasa Arab"),
  ...paired("tafsir", "tafsir-indonesia", "Tafsir Bahasa Indonesia"),
  ...paired("tafsir", "tafsir-inggris", "Tafsir Bahasa Inggris"),
  division("contoh-fahmil-regu", "fahmil", "Fahmil Putra", "putra", "team"),
  division("fahmil-putri", "fahmil", "Fahmil Putri", "putri", "team"),
  ...paired("syarhil", "syarhil", "Syarhil", "team"),
  ...paired("khat", "khat-naskah", "Kaligrafi Naskah"),
  ...paired("khat", "khat-hiasan-mushaf", "Kaligrafi Hiasan Mushaf"),
  ...paired("khat", "khat-dekorasi", "Kaligrafi Dekorasi"),
  ...paired("khat", "khat-kontemporer", "Kaligrafi Kontemporer"),
  ...paired("karya-tulis-ilmiah-al-quran", "ktiq", "Karya Tulis Ilmiah Al-Qur'an"),
];

export const demoAwardSlots = [
  { id: "juara-1", label: "Juara I (draf)" },
  { id: "juara-2", label: "Juara II (draf)" },
  { id: "juara-3", label: "Juara III (draf)" },
];
