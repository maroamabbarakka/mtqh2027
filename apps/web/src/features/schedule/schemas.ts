import { z } from "zod";
import { technicalIdSchema } from "@/features/master-data/schemas";

export const venueSchema = z.object({
  id: technicalIdSchema,
  name: z.string().trim().min(3, "Nama arena minimal 3 karakter.").max(100),
  description: z.string().trim().max(240),
});

export const scheduleSchema = z.object({
  divisionId: technicalIdSchema,
  venueId: technicalIdSchema,
  title: z.string().trim().min(3, "Judul sesi minimal 3 karakter.").max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal sesi."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Pilih waktu mulai."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Pilih waktu selesai."),
  notes: z.string().trim().max(240),
}).refine((value) => value.endTime > value.startTime, { path: ["endTime"], message: "Waktu selesai harus setelah waktu mulai." });

export type VenueInput = z.infer<typeof venueSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
