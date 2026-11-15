import { collection, doc, getDocs, limit, query, serverTimestamp, where, writeBatch, type Firestore } from "firebase/firestore";
import type { RegistrationInput } from "./schemas";
import { parseMemberNames } from "./schemas";
import type { Registration } from "./types";

export type RegistrationTransition = "submitted" | "under_review" | "revision_required" | "rejected";

export async function loadRegistrations(firestore: Firestore, eventId: string, districtIds?: string[]) {
  const base = collection(firestore, "events", eventId, "registrations");
  const request = districtIds?.length === 1
    ? query(base, where("districtId", "==", districtIds[0]), limit(50))
    : query(base, limit(50));
  const snapshot = await getDocs(request);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Registration)
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function createDraftRegistration(firestore: Firestore, eventId: string, uid: string, branchId: string, input: RegistrationInput) {
  const batch = writeBatch(firestore);
  const entry = doc(collection(firestore, "events", eventId, "registrations"));
  const entity = doc(collection(firestore, "events", eventId, input.entryType === "team" ? "teams" : "participants"));
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  const displayName = input.entryType === "team" ? input.teamName : input.fullName;
  const common = { eventId, districtId: input.districtId, divisionId: input.divisionId, status: "draft", createdBy: uid, createdAt: serverTimestamp(), updatedBy: uid, updatedAt: serverTimestamp(), idempotencyKey };
  if (input.entryType === "individual") {
    batch.set(entity, { ...common, fullName: input.fullName, gender: input.gender, managerName: input.managerName, managerPhone: input.managerPhone, notes: input.notes });
  } else {
    batch.set(entity, { ...common, teamName: input.teamName, gender: input.gender, memberNames: parseMemberNames(input.memberNames), managerName: input.managerName, managerPhone: input.managerPhone, notes: input.notes });
  }
  batch.set(entry, { ...common, branchId, entryType: input.entryType, displayName, participantId: input.entryType === "individual" ? entity.id : null, teamId: input.entryType === "team" ? entity.id : null, eligibilityStatus: "needs_manual_review" });
  batch.set(audit, { actorUid: uid, action: "registration_created", resourceType: "registration", resourceId: entry.id, summary: `${input.entryType === "team" ? "Regu" : "Peserta"} draft dibuat untuk ${input.districtId}`, createdAt: serverTimestamp(), idempotencyKey });
  await batch.commit();
  return entry.id;
}

export async function transitionRegistration(
  firestore: Firestore,
  eventId: string,
  entryId: string,
  uid: string,
  nextStatus: RegistrationTransition,
  reason?: string,
) {
  const batch = writeBatch(firestore);
  const entry = doc(firestore, "events", eventId, "registrations", entryId);
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  const actionByStatus = {
    submitted: "registration_submitted",
    under_review: "registration_review_started",
    revision_required: "registration_revision_requested",
    rejected: "registration_rejected",
  } as const;
  const labelByStatus = {
    submitted: "diajukan untuk pemeriksaan",
    under_review: "mulai diperiksa",
    revision_required: "dikembalikan untuk revisi",
    rejected: "ditolak secara administratif",
  } as const;
  const update: Record<string, unknown> = {
    status: nextStatus,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
    idempotencyKey,
  };
  if (nextStatus === "submitted") {
    update.submittedBy = uid;
    update.submittedAt = serverTimestamp();
  } else {
    update.reviewedBy = uid;
    update.reviewedAt = serverTimestamp();
    if (reason) update.reviewReason = reason;
  }
  batch.update(entry, update);
  batch.set(audit, {
    actorUid: uid,
    action: actionByStatus[nextStatus],
    resourceType: "registration",
    resourceId: entryId,
    summary: `Pendaftaran ${labelByStatus[nextStatus]}`,
    createdAt: serverTimestamp(),
    idempotencyKey,
  });
  await batch.commit();
}
