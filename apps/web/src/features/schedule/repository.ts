import { collection, getDocs, limit, query, type Firestore } from "firebase/firestore";
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

export function scheduleStart(item: Schedule) {
  if (item.startAt) return item.startAt.toDate().toISOString();
  return `${item.date ?? "9999-12-31"}T${item.startTime ?? "23:59"}`;
}
