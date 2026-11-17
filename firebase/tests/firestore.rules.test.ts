import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const projectId = "mtqh-pinrang-2027-demo";
const eventId = "mtqh-pinrang-2027";
let environment: RulesTestEnvironment;

const assignment = (
  roles: string[],
  districtIds: string[] = [],
  branchIds: string[] = [],
) => ({
  assignments: roles.map((role) => ({ role, eventId, status: "active" })),
  accessByEvent: { [eventId]: { roles, districtIds, branchIds } },
  disabled: false,
  revision: 1,
});

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(resolve("firebase/firestore.rules"), "utf8"),
    },
  });
});
afterAll(async () => environment.cleanup());
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(
        doc(db, "roleAssignments", "kafilah-tiroang"),
        assignment(["kafilah_admin"], ["tiroang"]),
      ),
      setDoc(
        doc(db, "roleAssignments", "kafilah-suppa"),
        assignment(["kafilah_admin"], ["suppa"]),
      ),
      setDoc(
        doc(db, "roleAssignments", "branch-tilawah"),
        assignment(["branch_admin"], [], ["tilawah"]),
      ),
      setDoc(
        doc(db, "roleAssignments", "contributor"),
        assignment(["contributor"]),
      ),
      setDoc(doc(db, "roleAssignments", "disabled-admin"), {
        ...assignment(["event_admin"]),
        disabled: true,
      }),
      setDoc(
        doc(db, "roleAssignments", "event-admin"),
        assignment(["event_admin"]),
      ),
      setDoc(
        doc(db, "roleAssignments", "verifier"),
        assignment(["verifier"]),
      ),
      setDoc(doc(db, "users/kafilah-tiroang"), {
        uid: "kafilah-tiroang",
        email: "tiroang@example.test",
        displayName: "Admin Tiroang",
        status: "active",
        mustChangePassword: true,
      }),
      setDoc(doc(db, `events/${eventId}`), {
        name: "MTQH Simulasi",
        stage: "draft",
      }),
      setDoc(doc(db, `events/${eventId}/districts/tiroang`), {
        id: "tiroang",
        eventId,
        name: "Tiroang",
        status: "official-reference",
      }),
      setDoc(doc(db, `events/${eventId}/branches/tilawah`), {
        id: "tilawah",
        eventId,
        name: "Tilawah",
        shortName: "Tilawah",
        description: "Draft",
        status: "draft",
        enabled: false,
        revision: 1,
        createdBy: "seed",
        createdAt: new Date(),
        updatedBy: "seed",
        updatedAt: new Date(),
        idempotencyKey: "seed-tilawah",
      }),
      setDoc(doc(db, `events/${eventId}/divisions/contoh-tilawah-putra`), {
        id: "contoh-tilawah-putra",
        eventId,
        branchId: "tilawah",
        name: "Contoh Tilawah Putra",
        gender: "putra",
        teamMode: "individual",
        status: "draft",
        enabled: false,
        limitsStatus: "draft_awaiting_juknis",
        awardSlots: [{ id: "juara-1", label: "Juara I" }],
        awardSlotsStatus: "draft",
        revision: 1,
        createdBy: "seed",
        createdAt: new Date(),
        updatedBy: "seed",
        updatedAt: new Date(),
        idempotencyKey: "seed-division",
      }),
      setDoc(doc(db, `events/${eventId}/venues/arena-simulasi-1`), {
        id: "arena-simulasi-1",
        eventId,
        name: "Arena Simulasi 1",
        status: "draft",
      }),
      setDoc(doc(db, `events/${eventId}/schedules/sesi-simulasi-1`), {
        eventId,
        branchId: "tilawah",
        divisionId: "contoh-tilawah-putra",
        venueId: "arena-simulasi-1",
        title: "Jadwal Simulasi",
        date: "2027-01-10",
        startTime: "08:00",
        endTime: "11:30",
        status: "draft",
      }),
      setDoc(doc(db, `events/${eventId}/participants/p-tiroang`), {
        districtId: "tiroang",
        name: "Peserta Contoh 001",
      }),
      setDoc(doc(db, `events/${eventId}/participants/p-suppa`), {
        districtId: "suppa",
        name: "Peserta Contoh 002",
      }),
      setDoc(doc(db, `events/${eventId}/registrations/workflow-entry`), {
        eventId,
        districtId: "tiroang",
        branchId: "tilawah",
        divisionId: "contoh-tilawah-putra",
        entryType: "individual",
        displayName: "Peserta Workflow",
        participantId: "p-tiroang",
        teamId: null,
        status: "draft",
        eligibilityStatus: "needs_manual_review",
        createdBy: "kafilah-tiroang",
        createdAt: new Date(),
        updatedBy: "kafilah-tiroang",
        updatedAt: new Date(),
        idempotencyKey: "seed-workflow",
      }),
      setDoc(doc(db, `events/${eventId}/registrations/verified-entry`), {
        eventId, districtId: "tiroang", branchId: "tilawah", divisionId: "contoh-tilawah-putra",
        entryType: "individual", displayName: "Peserta Terverifikasi", participantId: "p-tiroang", teamId: null,
        status: "verified", eligibilityStatus: "needs_manual_review", createdBy: "seed", createdAt: new Date(),
        updatedBy: "seed", updatedAt: new Date(), idempotencyKey: "verified-seed",
      }),
      setDoc(doc(db, `events/${eventId}/resultSubmissions/r-tilawah`), {
        branchId: "tilawah",
        submittedBy: "branch-tilawah",
        status: "draft",
      }),
      setDoc(doc(db, `events/${eventId}/resultSubmissions/r-tahfiz`), {
        branchId: "tahfiz",
        submittedBy: "orang-lain",
        status: "draft",
      }),
      setDoc(doc(db, `events/${eventId}/news/n-contributor`), {
        authorUid: "contributor",
        status: "draft",
        title: "Simulasi",
      }),
      setDoc(doc(db, `publicEvents/${eventId}/snapshots/v1`), {
        dataVersion: 1,
        updatedAt: "2026-11-15T00:00:00+08:00",
      }),
    ]);
  });
});

describe("Firestore RBAC dan isolasi data", () => {
  it("mengizinkan akun aktif membaca jadwal draf dan menolak perubahan dari browser", async () => {
    const reader = environment.authenticatedContext("kafilah-tiroang").firestore();
    const target = doc(reader, `events/${eventId}/schedules/sesi-simulasi-1`);
    await assertSucceeds(getDoc(target));
    await assertFails(updateDoc(target, { title: "Perubahan tanpa kewenangan" }));
  });

  it("mengizinkan admin event membuat arena draf dengan audit dan menolak admin kafilah", async () => {
    const admin = environment.authenticatedContext("event-admin").firestore();
    const batch = writeBatch(admin);
    batch.set(doc(admin, `events/${eventId}/venues/arena-baru`), {
      id: "arena-baru", eventId, name: "Arena Baru", description: "Draf", status: "draft", revision: 1,
      createdBy: "event-admin", createdAt: serverTimestamp(), updatedBy: "event-admin", updatedAt: serverTimestamp(), idempotencyKey: "venue-create-1",
    });
    batch.set(doc(collection(admin, `events/${eventId}/eventAudit`)), {
      actorUid: "event-admin", action: "schedule_venue_created", resourceType: "venue", resourceId: "arena-baru",
      summary: "Arena draf Arena Baru dibuat", createdAt: serverTimestamp(), idempotencyKey: "venue-create-1",
    });
    await assertSucceeds(batch.commit());

    const kafilah = environment.authenticatedContext("kafilah-tiroang").firestore();
    await assertFails(setDoc(doc(kafilah, `events/${eventId}/venues/arena-liar`), {
      id: "arena-liar", eventId, name: "Arena Liar", description: "", status: "draft", revision: 1,
      createdBy: "kafilah-tiroang", createdAt: serverTimestamp(), updatedBy: "kafilah-tiroang", updatedAt: serverTimestamp(), idempotencyKey: "forbidden",
    }));
  });
  it("mengizinkan admin kafilah membaca wilayah sendiri dan menolak wilayah lain", async () => {
    const db = environment
      .authenticatedContext("kafilah-tiroang", {
        email: "tiroang@example.test",
      })
      .firestore();
    await assertSucceeds(
      getDoc(doc(db, `events/${eventId}/participants/p-tiroang`)),
    );
    await assertFails(
      getDoc(doc(db, `events/${eventId}/participants/p-suppa`)),
    );
  });

  it("menolak branch admin membaca atau menulis hasil cabang lain", async () => {
    const db = environment.authenticatedContext("branch-tilawah").firestore();
    await assertSucceeds(
      getDoc(doc(db, `events/${eventId}/resultSubmissions/r-tilawah`)),
    );
    await assertFails(
      getDoc(doc(db, `events/${eventId}/resultSubmissions/r-tahfiz`)),
    );
    await assertFails(
      setDoc(doc(db, `events/${eventId}/resultSubmissions/new-tahfiz`), {
        branchId: "tahfiz",
        submittedBy: "branch-tilawah",
        status: "submitted",
      }),
    );
  });

  it("mengizinkan draft hasil terverifikasi dan menolak peserta nonverified atau field skor", async () => {
    const db = environment.authenticatedContext("branch-tilawah").firestore();
    const batch = writeBatch(db);
    const result = doc(db, `events/${eventId}/resultSubmissions/result-valid`);
    const base = {
      eventId, branchId: "tilawah", divisionId: "contoh-tilawah-putra",
      winners: [{ awardId: "juara-1", entryId: "verified-entry" }], sourceDocumentNumber: "BA-DRAFT-001",
      establishedAt: "2027-01-15", notes: "Simulasi internal", status: "draft", revision: 1,
      createdBy: "branch-tilawah", createdAt: serverTimestamp(), updatedBy: "branch-tilawah",
      updatedAt: serverTimestamp(), idempotencyKey: "result-key-1",
    };
    batch.set(result, base);
    batch.set(doc(collection(db, `events/${eventId}/eventAudit`)), {
      actorUid: "branch-tilawah", action: "result_draft_created", resourceType: "resultSubmission",
      resourceId: "result-valid", summary: "Draft hasil dibuat", createdAt: serverTimestamp(), idempotencyKey: "result-key-1",
    });
    await assertSucceeds(batch.commit());
    await assertFails(setDoc(doc(db, `events/${eventId}/resultSubmissions/result-unverified`), {
      ...base, winners: [{ awardId: "juara-1", entryId: "workflow-entry" }], idempotencyKey: "result-key-2",
    }));
    await assertFails(setDoc(doc(db, `events/${eventId}/resultSubmissions/result-score`), {
      ...base, score: 99, idempotencyKey: "result-key-3",
    }));
  });

  it("menolak client menulis role assignment sendiri", async () => {
    const db = environment.authenticatedContext("kafilah-tiroang").firestore();
    await assertFails(
      updateDoc(doc(db, "roleAssignments/kafilah-tiroang"), {
        disabled: false,
        revision: 2,
      }),
    );
    await assertFails(deleteDoc(doc(db, "roleAssignments/kafilah-tiroang")));
  });

  it("menolak contributor menerbitkan artikelnya sendiri", async () => {
    const db = environment.authenticatedContext("contributor").firestore();
    await assertFails(
      updateDoc(doc(db, `events/${eventId}/news/n-contributor`), {
        status: "published",
      }),
    );
  });

  it("menolak akun disabled dan anonim pada data privat", async () => {
    const disabled = environment
      .authenticatedContext("disabled-admin")
      .firestore();
    const anonymous = environment.unauthenticatedContext().firestore();
    await assertFails(
      getDoc(doc(disabled, `events/${eventId}/participants/p-tiroang`)),
    );
    await assertFails(
      getDoc(doc(anonymous, `events/${eventId}/participants/p-tiroang`)),
    );
  });

  it("mengizinkan publik hanya membaca proyeksi publicEvents", async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertSucceeds(
      getDoc(doc(db, `publicEvents/${eventId}/snapshots/v1`)),
    );
    await assertFails(
      setDoc(doc(db, `publicEvents/${eventId}/snapshots/v2`), {
        dataVersion: 2,
      }),
    );
  });

  it("mengizinkan pemilik melengkapi profil tanpa mengubah identitas atau status", async () => {
    const db = environment
      .authenticatedContext("kafilah-tiroang", {
        email: "tiroang@example.test",
      })
      .firestore();
    await assertSucceeds(
      updateDoc(doc(db, "users/kafilah-tiroang"), {
        displayName: "Admin Kafilah Tiroang",
        phone: "08123456789",
        organization: "Kafilah Tiroang",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, "users/kafilah-tiroang"), { status: "disabled" }),
    );
    await assertFails(
      updateDoc(doc(db, "users/kafilah-tiroang"), {
        email: "penyerang@example.test",
      }),
    );
  });

  it("membatasi penyelesaian password sementara dan aktivitas tetap append-only", async () => {
    const db = environment
      .authenticatedContext("kafilah-tiroang", {
        email: "tiroang@example.test",
      })
      .firestore();
    await assertSucceeds(
      updateDoc(doc(db, "users/kafilah-tiroang"), {
        mustChangePassword: false,
        lastPasswordChangeAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, "users/kafilah-tiroang"), {
        mustChangePassword: true,
        updatedAt: serverTimestamp(),
      }),
    );
    const activity = await assertSucceeds(
      addDoc(collection(db, "users/kafilah-tiroang/activity"), {
        actorUid: "kafilah-tiroang",
        action: "password_changed",
        summary: "Kata sandi akun diubah",
        createdAt: serverTimestamp(),
        source: "web",
      }),
    );
    await assertFails(updateDoc(activity, { summary: "Log dipalsukan" }));
    await assertFails(deleteDoc(activity));
  });

  it("menolak user menulis aktivitas atas nama akun lain", async () => {
    const db = environment.authenticatedContext("kafilah-tiroang").firestore();
    await assertFails(
      addDoc(collection(db, "users/kafilah-tiroang/activity"), {
        actorUid: "orang-lain",
        action: "login",
        summary: "Login palsu",
        createdAt: serverTimestamp(),
        source: "web",
      }),
    );
  });

  it("mengizinkan event admin membuat cabang draft bersama audit atomik", async () => {
    const db = environment.authenticatedContext("event-admin").firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, `events/${eventId}/branches/tahfiz`), {
      id: "tahfiz",
      eventId,
      name: "Tahfiz Al-Quran",
      shortName: "Tahfiz",
      description: "Belum disahkan",
      status: "draft",
      enabled: false,
      revision: 1,
      createdBy: "event-admin",
      createdAt: serverTimestamp(),
      updatedBy: "event-admin",
      updatedAt: serverTimestamp(),
      idempotencyKey: "00000000-0000-4000-8000-000000000001",
    });
    batch.set(doc(collection(db, `events/${eventId}/eventAudit`)), {
      actorUid: "event-admin",
      action: "master_branch_created",
      resourceType: "branch",
      resourceId: "tahfiz",
      summary: "Cabang draft Tahfiz dibuat",
      createdAt: serverTimestamp(),
      idempotencyKey: "00000000-0000-4000-8000-000000000001",
    });
    await assertSucceeds(batch.commit());
  });

  it("menolak admin kafilah mengubah master data dan menolak status non-draft", async () => {
    const kafilah = environment
      .authenticatedContext("kafilah-tiroang")
      .firestore();
    const admin = environment.authenticatedContext("event-admin").firestore();
    const payload = {
      id: "tahfiz",
      eventId,
      name: "Tahfiz",
      shortName: "Tahfiz",
      description: "Draft",
      status: "draft",
      enabled: false,
      revision: 1,
      createdBy: "kafilah-tiroang",
      createdAt: serverTimestamp(),
      updatedBy: "kafilah-tiroang",
      updatedAt: serverTimestamp(),
      idempotencyKey: "x",
    };
    await assertFails(
      setDoc(doc(kafilah, `events/${eventId}/branches/tahfiz`), payload),
    );
    await assertFails(
      setDoc(doc(admin, `events/${eventId}/branches/tahfiz-resmi`), {
        ...payload,
        id: "tahfiz-resmi",
        createdBy: "event-admin",
        updatedBy: "event-admin",
        status: "approved",
        enabled: true,
      }),
    );
  });

  it("menolak golongan dengan cabang tidak dikenal dan menjaga audit append-only", async () => {
    const db = environment.authenticatedContext("event-admin").firestore();
    await assertFails(
      setDoc(doc(db, `events/${eventId}/divisions/golongan-x`), {
        id: "golongan-x",
        eventId,
        branchId: "tidak-ada",
        name: "Golongan X",
        gender: "putra",
        teamMode: "individual",
        status: "draft",
        enabled: false,
        limitsStatus: "draft_awaiting_juknis",
        revision: 1,
        createdBy: "event-admin",
        createdAt: serverTimestamp(),
        updatedBy: "event-admin",
        updatedAt: serverTimestamp(),
        idempotencyKey: "x",
      }),
    );
    const audit = doc(collection(db, `events/${eventId}/eventAudit`));
    await assertSucceeds(
      setDoc(audit, {
        actorUid: "event-admin",
        action: "master_branch_updated",
        resourceType: "branch",
        resourceId: "tilawah",
        summary: "Cabang draft diperbarui",
        createdAt: serverTimestamp(),
        idempotencyKey: "audit-1",
      }),
    );
    await assertFails(deleteDoc(audit));
  });

  it("mengizinkan event admin mengatur slot penghargaan draft secara atomik", async () => {
    const db = environment.authenticatedContext("event-admin").firestore();
    const batch = writeBatch(db);
    batch.update(doc(db, `events/${eventId}/divisions/contoh-tilawah-putra`), {
      awardSlots: [{ id: "juara-1", label: "Juara I" }, { id: "juara-2", label: "Juara II" }],
      revision: 2, updatedBy: "event-admin", updatedAt: serverTimestamp(), idempotencyKey: "award-slots-1",
    });
    batch.set(doc(collection(db, `events/${eventId}/eventAudit`)), {
      actorUid: "event-admin", action: "master_division_updated", resourceType: "division", resourceId: "contoh-tilawah-putra",
      summary: "Slot penghargaan draft diperbarui", createdAt: serverTimestamp(), idempotencyKey: "award-slots-1",
    });
    await assertSucceeds(batch.commit());
    await assertFails(updateDoc(doc(db, `events/${eventId}/divisions/contoh-tilawah-putra`), {
      awardSlots: [{ id: "Juara 1", label: "" }],
      revision: 3, updatedBy: "event-admin", updatedAt: serverTimestamp(), idempotencyKey: "award-slots-invalid",
    }));
    const kafilah = environment.authenticatedContext("kafilah-tiroang").firestore();
    await assertFails(updateDoc(doc(kafilah, `events/${eventId}/divisions/contoh-tilawah-putra`), { awardSlots: [] }));
  });

  it("mengizinkan draft peserta atomik dalam scope dan menolak lintas wilayah", async () => {
    const ownDb = environment.authenticatedContext("kafilah-tiroang").firestore();
    const otherDb = environment.authenticatedContext("kafilah-suppa").firestore();
    const participantId = "participant-new";
    const entryId = "registration-new";
    const base = {
      eventId,
      districtId: "tiroang",
      divisionId: "contoh-tilawah-putra",
      status: "draft",
      createdBy: "kafilah-tiroang",
      createdAt: serverTimestamp(),
      updatedBy: "kafilah-tiroang",
      updatedAt: serverTimestamp(),
      idempotencyKey: "registration-key-1",
    };
    const batch = writeBatch(ownDb);
    batch.set(doc(ownDb, `events/${eventId}/participants/${participantId}`), {
      ...base,
      fullName: "Peserta Baru",
      gender: "putra",
      managerName: "Pengurus Tiroang",
      managerPhone: "081234567890",
      notes: "",
    });
    batch.set(doc(ownDb, `events/${eventId}/registrations/${entryId}`), {
      ...base,
      branchId: "tilawah",
      entryType: "individual",
      displayName: "Peserta Baru",
      participantId,
      teamId: null,
      eligibilityStatus: "needs_manual_review",
    });
    batch.set(doc(collection(ownDb, `events/${eventId}/eventAudit`)), {
      actorUid: "kafilah-tiroang",
      action: "registration_created",
      resourceType: "registration",
      resourceId: entryId,
      summary: "Peserta draft dibuat untuk tiroang",
      createdAt: serverTimestamp(),
      idempotencyKey: "registration-key-1",
    });
    await assertSucceeds(batch.commit());
    await assertFails(setDoc(doc(otherDb, `events/${eventId}/participants/forbidden`), {
      ...base,
      createdBy: "kafilah-suppa",
      updatedBy: "kafilah-suppa",
      fullName: "Lintas Wilayah",
      gender: "putra",
      managerName: "Pengurus Suppa",
      managerPhone: "081234567890",
      notes: "",
    }));
  });

  it("menjaga state machine submit dan review dengan pemisahan tugas", async () => {
    const owner = environment.authenticatedContext("kafilah-tiroang").firestore();
    const verifier = environment.authenticatedContext("verifier").firestore();
    const targetPath = `events/${eventId}/registrations/workflow-entry`;
    const submitBatch = writeBatch(owner);
    submitBatch.update(doc(owner, targetPath), {
      status: "submitted",
      submittedBy: "kafilah-tiroang",
      submittedAt: serverTimestamp(),
      updatedBy: "kafilah-tiroang",
      updatedAt: serverTimestamp(),
      idempotencyKey: "submit-workflow",
    });
    submitBatch.set(doc(collection(owner, `events/${eventId}/eventAudit`)), {
      actorUid: "kafilah-tiroang",
      action: "registration_submitted",
      resourceType: "registration",
      resourceId: "workflow-entry",
      summary: "Pendaftaran diajukan untuk pemeriksaan",
      createdAt: serverTimestamp(),
      idempotencyKey: "submit-workflow",
    });
    await assertSucceeds(submitBatch.commit());

    await assertFails(updateDoc(doc(owner, targetPath), {
      status: "under_review",
      reviewedBy: "kafilah-tiroang",
      reviewedAt: serverTimestamp(),
      updatedBy: "kafilah-tiroang",
      updatedAt: serverTimestamp(),
      idempotencyKey: "self-review",
    }));

    const claimBatch = writeBatch(verifier);
    claimBatch.update(doc(verifier, targetPath), {
      status: "under_review",
      reviewedBy: "verifier",
      reviewedAt: serverTimestamp(),
      updatedBy: "verifier",
      updatedAt: serverTimestamp(),
      idempotencyKey: "claim-workflow",
    });
    claimBatch.set(doc(collection(verifier, `events/${eventId}/eventAudit`)), {
      actorUid: "verifier",
      action: "registration_review_started",
      resourceType: "registration",
      resourceId: "workflow-entry",
      summary: "Pemeriksaan pendaftaran dimulai",
      createdAt: serverTimestamp(),
      idempotencyKey: "claim-workflow",
    });
    await assertSucceeds(claimBatch.commit());

    await assertFails(updateDoc(doc(verifier, targetPath), {
      status: "verified",
      reviewedAt: serverTimestamp(),
      updatedBy: "verifier",
      updatedAt: serverTimestamp(),
      idempotencyKey: "forbidden-verify",
    }));
    await assertFails(updateDoc(doc(verifier, targetPath), {
      status: "revision_required",
      reviewReason: "singkat",
      reviewedAt: serverTimestamp(),
      updatedBy: "verifier",
      updatedAt: serverTimestamp(),
      idempotencyKey: "short-reason",
    }));

    const decisionBatch = writeBatch(verifier);
    decisionBatch.update(doc(verifier, targetPath), {
      status: "revision_required",
      reviewReason: "Mohon perbaiki nama resmi sesuai administrasi kafilah.",
      reviewedAt: serverTimestamp(),
      updatedBy: "verifier",
      updatedAt: serverTimestamp(),
      idempotencyKey: "revision-workflow",
    });
    decisionBatch.set(doc(collection(verifier, `events/${eventId}/eventAudit`)), {
      actorUid: "verifier",
      action: "registration_revision_requested",
      resourceType: "registration",
      resourceId: "workflow-entry",
      summary: "Pendaftaran dikembalikan untuk revisi",
      createdAt: serverTimestamp(),
      idempotencyKey: "revision-workflow",
    });
    await assertSucceeds(decisionBatch.commit());
  });
});
