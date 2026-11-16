import { collection, doc, getDocs, limit, query, serverTimestamp, where, writeBatch, type Firestore } from "firebase/firestore";
import type { Registration } from "@/features/registration/types";
import type { ResultSubmission, ResultSubmissionInput } from "./types";

export async function loadVerifiedEntries(firestore: Firestore, eventId: string, branchId: string, divisionId: string) {
  const snapshot = await getDocs(query(collection(firestore, "events", eventId, "registrations"), where("branchId", "==", branchId), where("divisionId", "==", divisionId), where("status", "==", "verified"), limit(50)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Registration);
}

export async function loadResultSubmissions(firestore: Firestore, eventId: string, branchIds?: string[]) {
  const base = collection(firestore, "events", eventId, "resultSubmissions");
  const request = branchIds?.length === 1 ? query(base, where("branchId", "==", branchIds[0]), limit(50)) : query(base, limit(50));
  const snapshot = await getDocs(request);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ResultSubmission);
}

export async function createDraftResult(firestore: Firestore, eventId: string, uid: string, input: ResultSubmissionInput) {
  const batch = writeBatch(firestore);
  const target = doc(collection(firestore, "events", eventId, "resultSubmissions"));
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.set(target, { ...input, eventId, status: "draft", revision: 1, createdBy: uid, createdAt: serverTimestamp(), updatedBy: uid, updatedAt: serverTimestamp(), idempotencyKey });
  batch.set(audit, { actorUid: uid, action: "result_draft_created", resourceType: "resultSubmission", resourceId: target.id, summary: `Draft hasil dibuat untuk ${input.divisionId}`, createdAt: serverTimestamp(), idempotencyKey });
  await batch.commit();
  return target.id;
}
