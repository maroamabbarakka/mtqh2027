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
});

export type BranchInput = z.infer<typeof branchSchema>;
export type DivisionInput = z.infer<typeof divisionSchema>;
