import type { Registration } from "./types";

type ExportOptions = {
  eventId: string;
  registrations: Registration[];
  districtNames: Record<string, string>;
  divisionNames: Record<string, string>;
  statusLabels: Record<Registration["status"], string>;
  scopeLabel: string;
  filterLabel: string;
  generatedAt?: Date;
};

const dangerousSpreadsheetPrefix = /^[=+\-@\t\r]/;

export function csvCell(value: string | number) {
  let normalized = String(value).replace(/\r?\n/g, " ");
  if (dangerousSpreadsheetPrefix.test(normalized)) normalized = `'${normalized}`;
  return `"${normalized.replace(/"/g, '""')}"`;
}

function witaTimestamp(value: Date) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Makassar", dateStyle: "medium", timeStyle: "medium", hour12: false }).format(value) + " WITA";
}

export function buildRegistrationCsv(options: ExportOptions) {
  const rows = [
    ["Laporan", "Pendaftaran Peserta & Regu — DRAFT INTERNAL"],
    ["Event ID", options.eventId],
    ["Dibuat", witaTimestamp(options.generatedAt ?? new Date())],
    ["Cakupan data", options.scopeLabel],
    ["Filter", options.filterLabel],
    ["Jumlah entri", options.registrations.length],
    [],
    ["ID Entri", "Tipe", "Nama entri", "Kecamatan ID", "Kecamatan", "Golongan ID", "Golongan", "Status"],
    ...options.registrations.map((item) => [item.id, item.entryType === "team" ? "Regu" : "Individual", item.displayName, item.districtId, options.districtNames[item.districtId] ?? item.districtId, item.divisionId, options.divisionNames[item.divisionId] ?? item.divisionId, options.statusLabels[item.status]]),
    [],
    ["Catatan", "Daftar maksimal 25 entri dari halaman aktif sesuai kewenangan akun. Berkas ini tidak memuat NIK, tanggal lahir, kontak, catatan pribadi, atau riwayat pemeriksaan."],
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function registrationExportFilename(eventId: string, generatedAt = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(generatedAt);
  return `pendaftaran-${eventId}-${date}.csv`;
}
