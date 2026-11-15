import { z } from "zod";

const technicalId = z.string().trim().regex(/^[a-z0-9][a-z0-9_-]{1,79}$/, "ID teknis tidak valid.");

export const resultWinnerSchema = z.object({
  awardId: technicalId,
  entryId: z.string().trim().min(3).max(128).regex(/^[A-Za-z0-9_-]+$/, "ID entri tidak valid."),
}).strict();

export const resultSubmissionSchema = z.object({
  branchId: technicalId,
  divisionId: technicalId,
  winners: z.array(resultWinnerSchema).min(1, "Pilih minimal satu penerima penghargaan.").max(6, "Maksimal enam slot penghargaan per pengajuan."),
  sourceDocumentNumber: z.string().trim().min(3, "Nomor berita acara minimal 3 karakter.").max(80),
  establishedAt: z.string().date("Tanggal penetapan tidak valid."),
  notes: z.string().trim().max(300),
}).strict().superRefine((value, context) => {
  const awardIds = value.winners.map((winner) => winner.awardId);
  const entryIds = value.winners.map((winner) => winner.entryId);
  if (new Set(awardIds).size !== awardIds.length) context.addIssue({ code: "custom", path: ["winners"], message: "Satu slot penghargaan hanya boleh digunakan sekali." });
  if (new Set(entryIds).size !== entryIds.length) context.addIssue({ code: "custom", path: ["winners"], message: "Satu peserta atau regu tidak boleh menerima dua penghargaan pada pengajuan yang sama." });
});

export type ResultSubmissionForm = z.infer<typeof resultSubmissionSchema>;
