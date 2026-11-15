import { describe, expect, it } from "vitest";
import { buildRegistrationCsv, csvCell, registrationExportFilename } from "./export";
import type { Registration } from "./types";

const entry: Registration = { id: "entry-001", eventId: "mtqh-pinrang-2027", districtId: "tiroang", branchId: "tilawah", divisionId: "contoh-tilawah-putra", entryType: "individual", displayName: "Peserta Contoh 001", participantId: "person-001", teamId: null, status: "submitted", eligibilityStatus: "needs_manual_review", createdBy: "uid-private", updatedBy: "uid-private", reviewReason: "Catatan privat tidak boleh diekspor" };
const statusLabels = { draft: "Draft", submitted: "Diajukan", under_review: "Sedang diperiksa", verified: "Terverifikasi", revision_required: "Perlu revisi", rejected: "Ditolak" } as const;

describe("registration CSV export", () => {
  it("menghasilkan UTF-8 BOM, metadata scope, dan kolom aman", () => {
    const csv = buildRegistrationCsv({ eventId: entry.eventId, registrations: [entry], districtNames: { tiroang: "Tiroang" }, divisionNames: { "contoh-tilawah-putra": "Tilawah Putra" }, statusLabels, scopeLabel: "Kecamatan Tiroang", filterLabel: "Status: Diajukan", generatedAt: new Date("2026-11-16T00:00:00Z") });
    expect(csv.startsWith("\uFEFF")).toBe(true); expect(csv).toContain('"Kecamatan Tiroang"'); expect(csv).toContain('"Peserta Contoh 001"'); expect(csv).not.toContain("uid-private"); expect(csv).not.toContain("Catatan privat tidak boleh diekspor");
  });
  it("mencegah formula injection dan meng-escape kutip", () => { expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"'); expect(csvCell("Nama, Peserta")).toBe('"Nama, Peserta"'); });
  it("membuat nama file stabil menurut tanggal WITA", () => { expect(registrationExportFilename("mtqh-pinrang-2027", new Date("2026-11-15T17:00:00Z"))).toBe("pendaftaran-mtqh-pinrang-2027-2026-11-16.csv"); });
});
