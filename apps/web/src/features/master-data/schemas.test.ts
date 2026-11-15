import { describe, expect, it } from "vitest";
import { branchSchema, divisionSchema, technicalIdSchema } from "./schemas";

describe("schema master data", () => {
  it("menerima ID stabil dan menolak label sebagai ID", () => {
    expect(technicalIdSchema.safeParse("tilawah-anak-putra").success).toBe(
      true,
    );
    expect(technicalIdSchema.safeParse("Tilawah Anak").success).toBe(false);
  });
  it("memaksa cabang memiliki label yang lengkap", () => {
    expect(
      branchSchema.safeParse({
        id: "tilawah",
        name: "Tilawah Al-Quran",
        shortName: "Tilawah",
        description: "",
      }).success,
    ).toBe(true);
    expect(
      branchSchema.safeParse({
        id: "x",
        name: "A",
        shortName: "A",
        description: "",
      }).success,
    ).toBe(false);
  });
  it("membatasi mode dan kategori golongan", () => {
    expect(
      divisionSchema.safeParse({
        id: "contoh-putra",
        branchId: "tilawah",
        name: "Contoh Putra",
        gender: "putra",
        teamMode: "individual",
      }).success,
    ).toBe(true);
    expect(
      divisionSchema.safeParse({
        id: "contoh",
        branchId: "tilawah",
        name: "Contoh",
        gender: "bebas",
        teamMode: "solo",
      }).success,
    ).toBe(false);
  });
});
