import { z } from "zod";

export const technicalIdSchema = z
  .string()
  .min(3)
  .max(60)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Gunakan huruf kecil, angka, dan tanda hubung.",
  );

export const branchSchema = z.object({
  id: technicalIdSchema,
  name: z.string().trim().min(3).max(100),
  shortName: z.string().trim().min(2).max(30),
  description: z.string().trim().max(240),
});

export const divisionSchema = z.object({
  id: technicalIdSchema,
  branchId: technicalIdSchema,
  name: z.string().trim().min(3).max(120),
  gender: z.enum(["putra", "putri", "campuran", "belum-ditetapkan"]),
  teamMode: z.enum(["individual", "team"]),
  awardSlotsText: z.string().trim().max(500),
}).superRefine((value, context) => {
  const slots = parseAwardSlots(value.awardSlotsText);
  if (slots.length > 6) context.addIssue({ code: "custom", path: ["awardSlotsText"], message: "Maksimal enam slot penghargaan." });
  const invalid = value.awardSlotsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).some((line) => {
    const [id, label, ...extra] = line.split("|");
    return extra.length > 0 || !technicalIdSchema.safeParse(id?.trim()).success || !label?.trim() || label.trim().length > 60;
  });
  if (invalid) context.addIssue({ code: "custom", path: ["awardSlotsText"], message: "Gunakan format id-teknis|Label, satu slot per baris." });
  if (new Set(slots.map((slot) => slot.id)).size !== slots.length) context.addIssue({ code: "custom", path: ["awardSlotsText"], message: "ID slot penghargaan tidak boleh duplikat." });
});

export function parseAwardSlots(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [id = "", label = ""] = line.split("|");
    return { id: id.trim(), label: label.trim() };
  });
}

export function formatAwardSlots(slots: Array<{ id: string; label: string }>) { return slots.map((slot) => `${slot.id}|${slot.label}`).join("\n"); }

export type BranchInput = z.infer<typeof branchSchema>;
export type DivisionInput = z.infer<typeof divisionSchema>;
