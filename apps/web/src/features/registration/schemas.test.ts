import { describe, expect, it } from "vitest";
import { registrationSchema, reviewReasonSchema } from "./schemas";

const base = { districtId: "tiroang", divisionId: "div-1", gender: "putra", managerName: "Pengurus Kafilah", managerPhone: "081234567890", notes: "", acknowledgement: true } as const;
describe("registrationSchema", () => {
  it("menerima peserta individual tanpa data identitas berlebih", () => expect(registrationSchema.safeParse({ ...base, entryType: "individual", fullName: "Ahmad Contoh", teamName: "", memberNames: "" }).success).toBe(true));
  it("mewajibkan minimal dua anggota regu", () => expect(registrationSchema.safeParse({ ...base, entryType: "team", fullName: "", teamName: "Regu A", memberNames: "Satu" }).success).toBe(false));
  it("mewajibkan alasan review yang dapat ditindaklanjuti", () => {
    expect(reviewReasonSchema.safeParse({ reason: "kurang" }).success).toBe(false);
    expect(reviewReasonSchema.safeParse({ reason: "Mohon perbaiki nama resmi peserta." }).success).toBe(true);
  });
});
