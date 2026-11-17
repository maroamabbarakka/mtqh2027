import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { demoAwardSlots, demoDivisions } from "./demo-catalog.mjs";

if (!process.argv.includes("--confirm-emulator"))
  throw new Error(
    "Seed diblokir: gunakan npm run seed:emulator agar target emulator dikonfirmasi eksplisit.",
  );

const app = initializeApp({
  projectId: "mtqh-pinrang-2027-demo",
  apiKey: "demo-key",
  authDomain: "demo.local",
});
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
const testEnvironment = await initializeTestEnvironment({
  projectId: "mtqh-pinrang-2027-demo",
  firestore: { host: "127.0.0.1", port: 8080 },
});
const resetResponse = await fetch(
  "http://127.0.0.1:9099/emulator/v1/projects/mtqh-pinrang-2027-demo/accounts",
  { method: "DELETE" },
);
if (!resetResponse.ok)
  throw new Error(`Reset akun emulator gagal (${resetResponse.status}).`);
await testEnvironment.withSecurityRulesDisabled(async (context) => {
  const firestore = context.firestore();
  for (const path of ["users", "roleAssignments"]) {
    const snapshot = await getDocs(collection(firestore, path));
    await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
  }
});
const users = [
  {
    email: "superadmin@example.test",
    name: "Super Admin Simulasi",
    role: "super_admin",
    districtIds: [],
    branchIds: [],
  },
  {
    email: "admin.event@example.test",
    name: "Admin Event Simulasi",
    role: "event_admin",
    districtIds: [],
    branchIds: [],
  },
  {
    email: "pengawas@example.test",
    name: "Pengawas Simulasi",
    role: "oversight",
    districtIds: [],
    branchIds: [],
  },
  {
    email: "admin.tiroang@example.test",
    name: "Admin Kafilah Tiroang",
    role: "kafilah_admin",
    districtIds: ["tiroang"],
    branchIds: [],
  },
  {
    email: "cabang.tilawah@example.test",
    name: "Admin Cabang Tilawah",
    role: "branch_admin",
    districtIds: [],
    branchIds: ["tilawah"],
  },
  {
    email: "verifikator@example.test",
    name: "Verifikator Simulasi",
    role: "verifier",
    districtIds: [],
    branchIds: [],
  },
  {
    email: "editor@example.test",
    name: "Editor Simulasi",
    role: "editor",
    districtIds: [],
    branchIds: [],
  },
  {
    email: "kontributor@example.test",
    name: "Kontributor Simulasi",
    role: "contributor",
    districtIds: [],
    branchIds: [],
  },
];
for (const item of users) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    item.email,
    "123456",
  );
  await updateProfile(credential.user, { displayName: item.name });
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    await setDoc(doc(firestore, "users", credential.user.uid), {
      uid: credential.user.uid,
      email: item.email,
      displayName: item.name,
      status: "active",
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await setDoc(doc(firestore, "roleAssignments", credential.user.uid), {
      assignments: [
        {
          role: item.role,
          eventId: "mtqh-pinrang-2027",
          status: "active",
          districtIds: item.districtIds,
          branchIds: item.branchIds,
        },
      ],
      accessByEvent: {
        "mtqh-pinrang-2027": {
          roles: [item.role],
          districtIds: item.districtIds,
          branchIds: item.branchIds,
        },
      },
      disabled: false,
      revision: 1,
    });
  });
}
const eventId = "mtqh-pinrang-2027";
const districts = [
  "Batulappa",
  "Cempa",
  "Duampanua",
  "Lanrisang",
  "Lembang",
  "Mattiro Bulu",
  "Mattiro Sompe",
  "Paleteang",
  "Patampanua",
  "Suppa",
  "Tiroang",
  "Watang Sawitto",
].map((name) => ({ id: name.toLowerCase().replaceAll(" ", "-"), name }));
const branches = [
  { id: "tilawah", name: "Tilawah Al-Qur’an", shortName: "Tilawah" },
  { id: "qiraat", name: "Qiraat Al-Qur’an", shortName: "Qiraat" },
  { id: "tahfiz", name: "Tahfiz Al-Qur’an", shortName: "Tahfiz" },
  { id: "tafsir", name: "Tafsir Al-Qur’an", shortName: "Tafsir" },
  { id: "fahmil", name: "Fahmil Qur’an", shortName: "Fahmil" },
  { id: "syarhil", name: "Syarhil Qur’an", shortName: "Syarhil" },
  { id: "khat", name: "Seni Kaligrafi Al-Qur’an", shortName: "Khat" },
  {
    id: "karya-tulis-ilmiah-al-quran",
    name: "Karya Tulis Ilmiah Al-Qur’an",
    shortName: "KTIQ",
  },
];
const legacyDivisions = [
  {
    id: "contoh-tilawah-putra",
    branchId: "tilawah",
    name: "Contoh Golongan Tilawah Putra",
    gender: "putra",
    teamMode: "individual",
  },
  {
    id: "contoh-tilawah-putri",
    branchId: "tilawah",
    name: "Contoh Golongan Tilawah Putri",
    gender: "putri",
    teamMode: "individual",
  },
  {
    id: "contoh-fahmil-regu",
    branchId: "fahmil",
    name: "Contoh Golongan Fahmil Regu",
    gender: "campuran",
    teamMode: "team",
  },
];
void legacyDivisions;
const divisions = demoDivisions;
await testEnvironment.withSecurityRulesDisabled(async (context) => {
  const firestore = context.firestore();
  for (const path of [
    `events/${eventId}/districts`,
    `events/${eventId}/branches`,
    `events/${eventId}/divisions`,
    `events/${eventId}/participants`,
    `events/${eventId}/teams`,
    `events/${eventId}/registrations`,
    `events/${eventId}/schedules`,
    `events/${eventId}/resultSubmissions`,
  ]) {
    const snapshot = await getDocs(collection(firestore, path));
    await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
  }
  await setDoc(doc(firestore, "events", eventId), {
    name: "MTQH XXXV Kabupaten Pinrang 2027",
    year: 2027,
    timezone: "Asia/Makassar",
    stage: "draft",
    decisionsStatus: "draft_awaiting_official_decision",
    hostDistrictId: "tiroang",
    updatedAt: new Date(),
  });
  await Promise.all(
    districts.map((item) =>
      setDoc(doc(firestore, `events/${eventId}/districts`, item.id), {
        ...item,
        eventId,
        status: "official-reference",
      }),
    ),
  );
  await Promise.all(
    branches.map((item) =>
      setDoc(doc(firestore, `events/${eventId}/branches`, item.id), {
        ...item,
        eventId,
        description: "Referensi konfigurasi; belum disahkan panitia.",
        status: "draft",
        enabled: false,
        revision: 1,
        createdBy: "emulator-seed",
        createdAt: new Date(),
        updatedBy: "emulator-seed",
        updatedAt: new Date(),
        idempotencyKey: `seed-${item.id}`,
      }),
    ),
  );
  await Promise.all(
    divisions.map((item) =>
      setDoc(doc(firestore, `events/${eventId}/divisions`, item.id), {
        ...item,
        eventId,
        status: "draft",
        enabled: false,
        limitsStatus: "draft_awaiting_juknis",
        awardSlots: demoAwardSlots,
        awardSlotsStatus: "draft",
        revision: 1,
        createdBy: "emulator-seed",
        createdAt: new Date(),
        updatedBy: "emulator-seed",
        updatedAt: new Date(),
        idempotencyKey: `seed-${item.id}`,
      }),
    ),
  );
  const registrations = divisions.flatMap((item, divisionIndex) => [1, 2, 3].map((rank) => {
    const suffix = String(rank).padStart(3, "0");
    const entryId = item.id === "contoh-tilawah-putra" ? `verified-tilawah-${suffix}` : `simulasi-${item.id}-${rank}`;
    const entityId = `${item.teamMode === "team" ? "team" : "participant"}-${item.id}-${rank}`;
    const district = districts[(divisionIndex * 3 + rank - 1) % districts.length];
    const displayName = item.teamMode === "team"
      ? `Regu Simulasi ${district.name} ${rank}`
      : `Peserta Simulasi ${String(divisionIndex * 3 + rank).padStart(3, "0")}`;
    return { item, entryId, entityId, district, displayName };
  }));
  await Promise.all(registrations.map(({ item, entityId, district, displayName }) =>
    setDoc(doc(firestore, `events/${eventId}/${item.teamMode === "team" ? "teams" : "participants"}`, entityId), {
      eventId, districtId: district.id, displayName, status: "simulation", createdAt: new Date(), updatedAt: new Date(),
    }),
  ));
  await Promise.all(registrations.map(({ item, entryId, entityId, district, displayName }) =>
    setDoc(doc(firestore, `events/${eventId}/registrations`, entryId), {
      eventId, districtId: district.id, branchId: item.branchId, divisionId: item.id, entryType: item.teamMode, displayName,
      participantId: item.teamMode === "team" ? null : entityId, teamId: item.teamMode === "team" ? entityId : null,
      status: "verified", eligibilityStatus: "needs_manual_review", createdBy: "emulator-seed", createdAt: new Date(),
      updatedBy: "emulator-seed", updatedAt: new Date(), idempotencyKey: `seed-${entryId}`,
    }),
  ));
  await Promise.all(divisions.map((item, index) => setDoc(doc(firestore, `events/${eventId}/schedules`, `simulasi-${item.id}`), {
    eventId, branchId: item.branchId, divisionId: item.id, venueId: null, title: `Jadwal Simulasi ${item.name}`,
    date: `2027-01-${String(10 + (index % 12)).padStart(2, "0")}`, startTime: "08:00", endTime: "11:30",
    status: "draft", notes: "Data simulasi; bukan jadwal resmi panitia.", updatedAt: new Date(),
  })));
  await Promise.all(divisions.map((item) => {
    const entries = registrations.filter((entry) => entry.item.id === item.id);
    return setDoc(doc(firestore, `events/${eventId}/resultSubmissions`, `simulasi-${item.id}`), {
      eventId, branchId: item.branchId, divisionId: item.id,
      winners: demoAwardSlots.map((slot, index) => ({ awardId: slot.id, entryId: entries[index].entryId })),
      sourceDocumentNumber: `SIMULASI/${item.id.toUpperCase()}/2027`, establishedAt: "2027-01-22",
      notes: "Data simulasi untuk pengujian; bukan hasil resmi.", status: "draft", createdBy: "emulator-seed",
      createdAt: new Date(), updatedBy: "emulator-seed", updatedAt: new Date(), idempotencyKey: `seed-result-${item.id}`,
    });
  }));
});
await testEnvironment.cleanup();
console.log(
  `Data simulasi selesai: ${users.length} akun, ${districts.length} kecamatan, ${branches.length} cabang, ${divisions.length} golongan, ${divisions.length * 3} pendaftaran, jadwal, dan draf hasil tanpa skor.`,
);
