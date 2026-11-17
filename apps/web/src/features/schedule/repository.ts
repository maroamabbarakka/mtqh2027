import { collection, doc, getDocs, limit, query, serverTimestamp, writeBatch, type Firestore } from "firebase/firestore";
import type { ScheduleInput, VenueInput } from "./schemas";
import type { Schedule, Venue } from "./types";

export async function loadDraftSchedules(firestore: Firestore, eventId: string) {
  const [scheduleSnapshot, venueSnapshot] = await Promise.all([
    getDocs(query(collection(firestore, "events", eventId, "schedules"), limit(50))),
    getDocs(query(collection(firestore, "events", eventId, "venues"), limit(50))),
  ]);
  const schedules = scheduleSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Schedule)
    .sort((a, b) => scheduleStart(a).localeCompare(scheduleStart(b), "id"));
  const venues = venueSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Venue)
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
  return { schedules, venues };
}

export async function createDraftVenue(firestore: Firestore, eventId: string, uid: string, input: VenueInput) {
  const batch = writeBatch(firestore);
  const target = doc(firestore, "events", eventId, "venues", input.id);
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.set(target, { ...input, eventId, status: "draft", revision: 1, createdBy: uid, createdAt: serverTimestamp(), updatedBy: uid, updatedAt: serverTimestamp(), idempotencyKey });
  batch.set(audit, { actorUid: uid, action: "schedule_venue_created", resourceType: "venue", resourceId: input.id, summary: `Arena draf ${input.name} dibuat`, createdAt: serverTimestamp(), idempotencyKey });
  await batch.commit();
}

export async function createDraftSchedule(firestore: Firestore, eventId: string, uid: string, branchId: string, input: ScheduleInput) {
  const batch = writeBatch(firestore);
  const target = doc(collection(firestore, "events", eventId, "schedules"));
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.set(target, { ...input, eventId, branchId, status: "draft", revision: 1, createdBy: uid, createdAt: serverTimestamp(), updatedBy: uid, updatedAt: serverTimestamp(), idempotencyKey });
  batch.set(audit, { actorUid: uid, action: "schedule_session_created", resourceType: "schedule", resourceId: target.id, summary: `Sesi draf ${input.title} dibuat`, createdAt: serverTimestamp(), idempotencyKey });
  await batch.commit();
}

export function scheduleStart(item: Schedule) {
  if (item.startAt) return item.startAt.toDate().toISOString();
  return `${item.date ?? "9999-12-31"}T${item.startTime ?? "23:59"}`;
}
