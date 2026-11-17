if (!process.argv.includes("--confirm-emulator")) {
  throw new Error("Pembersihan diblokir. Jalankan melalui npm run reset:emulator-demo.");
}

const projectId = "mtqh-pinrang-2027-demo";
const targets = [
  `http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`,
  `http://127.0.0.1:8080/emulator/v1/projects/${projectId}/databases/(default)/documents`,
];

for (const target of targets) {
  const response = await fetch(target, { method: "DELETE" });
  if (!response.ok) throw new Error(`Data simulasi belum dapat dibersihkan (${response.status}).`);
}

console.log("Seluruh akun dan data simulasi lokal berhasil dibersihkan.");
