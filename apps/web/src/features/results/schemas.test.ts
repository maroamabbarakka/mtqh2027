import { describe, expect, it } from "vitest";
import { resultSubmissionSchema } from "./schemas";

const valid = { branchId: "tilawah", divisionId: "contoh-tilawah-putra", winners: [{ awardId: "juara-utama", entryId: "entry-001" }], sourceDocumentNumber: "BA-DRAFT-001", establishedAt: "2027-01-15", notes: "Simulasi internal" };

describe("resultSubmissionSchema", () => {
  it("menerima slot penghargaan dinamis tanpa field skor", () => { expect(resultSubmissionSchema.safeParse(valid).success).toBe(true); });
  it("menolak satu entry pada dua slot", () => { const result = resultSubmissionSchema.safeParse({ ...valid, winners: [{ awardId: "utama", entryId: "entry-001" }, { awardId: "harapan", entryId: "entry-001" }] }); expect(result.success).toBe(false); });
  it("menolak slot penghargaan duplikat", () => { const result = resultSubmissionSchema.safeParse({ ...valid, winners: [{ awardId: "utama", entryId: "entry-001" }, { awardId: "utama", entryId: "entry-002" }] }); expect(result.success).toBe(false); });
  it("menolak field skor atau nilai yang tidak dikenal", () => { expect(resultSubmissionSchema.safeParse({ ...valid, score: 99 }).success).toBe(false); });
  it("mewajibkan berita acara dan tanggal penetapan valid", () => { expect(resultSubmissionSchema.safeParse({ ...valid, sourceDocumentNumber: "", establishedAt: "15/01/2027" }).success).toBe(false); });
});
