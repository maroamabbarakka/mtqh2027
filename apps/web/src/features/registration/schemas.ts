import { z } from "zod";

export const registrationSchema = z
  .object({
    entryType: z.enum(["individual", "team"]),
    districtId: z.string().min(1, "Pilih kecamatan."),
    divisionId: z.string().min(1, "Pilih golongan."),
    fullName: z.string().trim().max(100),
    gender: z.enum(["putra", "putri", "campuran", "belum-ditetapkan"]),
    teamName: z.string().trim().max(100),
    memberNames: z.string().trim().max(600),
    managerName: z.string().trim().min(3, "Nama pengurus minimal 3 karakter.").max(100),
    managerPhone: z.string().trim().min(8, "Nomor pengurus minimal 8 digit.").max(20),
    notes: z.string().trim().max(300),
    acknowledgement: z.boolean().refine(Boolean, "Konfirmasi kebenaran data wajib dicentang."),
  })
  .superRefine((value, context) => {
    if (value.entryType === "individual" && value.fullName.length < 3)
      context.addIssue({ code: "custom", path: ["fullName"], message: "Nama peserta minimal 3 karakter." });
    if (value.entryType === "team") {
      if (value.teamName.length < 3)
        context.addIssue({ code: "custom", path: ["teamName"], message: "Nama regu minimal 3 karakter." });
      const members = parseMemberNames(value.memberNames);
      if (members.length < 2)
        context.addIssue({ code: "custom", path: ["memberNames"], message: "Tuliskan minimal 2 anggota, satu nama per baris." });
      if (members.length > 10)
        context.addIssue({ code: "custom", path: ["memberNames"], message: "Maksimal 10 anggota pada tahap konfigurasi awal." });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function parseMemberNames(value: string) {
  return value.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
}

export const reviewReasonSchema = z.object({
  reason: z.string().trim().min(10, "Alasan minimal 10 karakter agar dapat ditindaklanjuti.").max(300),
});
export type ReviewReasonInput = z.infer<typeof reviewReasonSchema>;
