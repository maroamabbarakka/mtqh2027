import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { parseAwardSlots, type BranchInput, type DivisionInput } from "./schemas";
import type { Branch, District, Division, EventConfiguration } from "./types";

export async function loadMasterData(firestore: Firestore, eventId: string) {
  const [eventSnapshot, districtSnapshot, branchSnapshot, divisionSnapshot] =
    await Promise.all([
      getDoc(doc(firestore, "events", eventId)),
      getDocs(collection(firestore, "events", eventId, "districts")),
      getDocs(collection(firestore, "events", eventId, "branches")),
      getDocs(collection(firestore, "events", eventId, "divisions")),
    ]);
  return {
    event: eventSnapshot.exists()
      ? ({
          id: eventSnapshot.id,
          ...eventSnapshot.data(),
        } as EventConfiguration)
      : null,
    districts: districtSnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }) as District)
      .sort((a, b) => a.name.localeCompare(b.name, "id")),
    branches: branchSnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }) as Branch)
      .sort((a, b) => a.name.localeCompare(b.name, "id")),
    divisions: divisionSnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }) as Division)
      .sort((a, b) => a.name.localeCompare(b.name, "id")),
  };
}

export async function createDraftBranch(
  firestore: Firestore,
  eventId: string,
  uid: string,
  input: BranchInput,
) {
  const batch = writeBatch(firestore);
  const target = doc(firestore, "events", eventId, "branches", input.id);
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.set(target, {
    ...input,
    eventId,
    status: "draft",
    enabled: false,
    revision: 1,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedBy: uid,
    updatedAt: serverTimestamp(),
    idempotencyKey,
  });
  batch.set(audit, {
    actorUid: uid,
    action: "master_branch_created",
    resourceType: "branch",
    resourceId: input.id,
    summary: `Cabang draft ${input.shortName} dibuat`,
    createdAt: serverTimestamp(),
    idempotencyKey,
  });
  await batch.commit();
}

export async function createDraftDivision(
  firestore: Firestore,
  eventId: string,
  uid: string,
  input: DivisionInput,
) {
  const batch = writeBatch(firestore);
  const target = doc(firestore, "events", eventId, "divisions", input.id);
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.set(target, {
    id: input.id, branchId: input.branchId, name: input.name, gender: input.gender, teamMode: input.teamMode,
    awardSlots: parseAwardSlots(input.awardSlotsText), awardSlotsStatus: "draft",
    eventId,
    status: "draft",
    enabled: false,
    limitsStatus: "draft_awaiting_juknis",
    revision: 1,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedBy: uid,
    updatedAt: serverTimestamp(),
    idempotencyKey,
  });
  batch.set(audit, {
    actorUid: uid,
    action: "master_division_created",
    resourceType: "division",
    resourceId: input.id,
    summary: `Golongan draft ${input.name} dibuat`,
    createdAt: serverTimestamp(),
    idempotencyKey,
  });
  await batch.commit();
}

export async function updateDraftBranch(
  firestore: Firestore,
  eventId: string,
  uid: string,
  input: BranchInput,
  revision: number,
) {
  const batch = writeBatch(firestore);
  const target = doc(firestore, "events", eventId, "branches", input.id);
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.update(target, {
    name: input.name,
    shortName: input.shortName,
    description: input.description,
    revision: revision + 1,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
    idempotencyKey,
  });
  batch.set(audit, {
    actorUid: uid,
    action: "master_branch_updated",
    resourceType: "branch",
    resourceId: input.id,
    summary: `Cabang draft ${input.shortName} diperbarui`,
    createdAt: serverTimestamp(),
    idempotencyKey,
  });
  await batch.commit();
}

export async function updateDraftDivision(
  firestore: Firestore,
  eventId: string,
  uid: string,
  input: DivisionInput,
  revision: number,
) {
  const batch = writeBatch(firestore);
  const target = doc(firestore, "events", eventId, "divisions", input.id);
  const audit = doc(collection(firestore, "events", eventId, "eventAudit"));
  const idempotencyKey = crypto.randomUUID();
  batch.update(target, {
    branchId: input.branchId,
    name: input.name,
    gender: input.gender,
    teamMode: input.teamMode,
    awardSlots: parseAwardSlots(input.awardSlotsText),
    revision: revision + 1,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
    idempotencyKey,
  });
  batch.set(audit, {
    actorUid: uid,
    action: "master_division_updated",
    resourceType: "division",
    resourceId: input.id,
    summary: `Golongan draft ${input.name} diperbarui`,
    createdAt: serverTimestamp(),
    idempotencyKey,
  });
  await batch.commit();
}
