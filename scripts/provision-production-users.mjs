import { readFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "mtqhpinrang2027";
const EVENT_ID = "mtqh-pinrang-2027";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index];
  if (!key.startsWith("--")) continue;
  const next = process.argv[index + 1];
  if (next && !next.startsWith("--")) {
    args.set(key, next);
    index += 1;
  } else {
    args.set(key, true);
  }
}

if (!args.has("--confirm-production")) {
  throw new Error("Provisioning diblokir. Tambahkan --confirm-production setelah target diperiksa.");
}

const credentialsPath = args.get("--credentials");
if (typeof credentialsPath !== "string") {
  throw new Error("Berikan lokasi service account melalui --credentials <path>.");
}

const apply = args.has("--apply");
const emailDomain = args.get("--email-domain") || "mtqhpinrang2027.id";
const temporaryPassword = process.env.MTQH_TEMP_PASSWORD;
const firebaseApiKey = process.env.MTQH_FIREBASE_API_KEY;
if (apply && (!temporaryPassword || temporaryPassword.length < 6)) {
  throw new Error("Atur MTQH_TEMP_PASSWORD minimal 6 karakter sebelum menjalankan --apply.");
}
if (apply && !firebaseApiKey) {
  throw new Error("Atur MTQH_FIREBASE_API_KEY sebelum menjalankan --apply.");
}

const districts = [
  ["batulappa", "Batulappa"], ["cempa", "Cempa"], ["duampanua", "Duampanua"],
  ["lanrisang", "Lanrisang"], ["lembang", "Lembang"], ["mattiro-bulu", "Mattiro Bulu"],
  ["mattiro-sompe", "Mattiro Sompe"], ["paleteang", "Paleteang"], ["patampanua", "Patampanua"],
  ["suppa", "Suppa"], ["tiroang", "Tiroang"], ["watang-sawitto", "Watang Sawitto"],
];

const branches = [
  ["tilawah", "Tilawah"], ["qiraat", "Qiraat"], ["tahfiz", "Tahfiz"],
  ["tafsir", "Tafsir"], ["fahmil", "Fahmil"], ["syarhil", "Syarhil"],
  ["khat", "Kaligrafi"], ["karya-tulis-ilmiah-al-quran", "KTIQ"],
];

const centralAccounts = [
  { username: "superadmin", displayName: "Super Admin MTQH Pinrang", role: "super_admin" },
  { username: "admin.event", displayName: "Admin Event MTQH Pinrang", role: "event_admin" },
  { username: "pengawas", displayName: "Pengawas MTQH Pinrang", role: "oversight" },
  { username: "verifikator", displayName: "Verifikator MTQH Pinrang", role: "verifier" },
  { username: "editor", displayName: "Editor MTQH Pinrang", role: "editor" },
  { username: "kontributor", displayName: "Kontributor MTQH Pinrang", role: "contributor" },
];

const accounts = [
  ...centralAccounts,
  ...districts.map(([id, name]) => ({
    username: `kafilah.${id}`,
    displayName: `Admin Kafilah ${name}`,
    role: "kafilah_admin",
    districtIds: [id],
  })),
  ...branches.map(([id, name]) => ({
    username: `cabang.${id}`,
    displayName: `Admin Cabang ${name}`,
    role: "branch_admin",
    branchIds: [id],
  })),
].map((item) => ({
  ...item,
  email: `${item.username}@${emailDomain}`,
  districtIds: item.districtIds ?? [],
  branchIds: item.branchIds ?? [],
}));

console.table(accounts.map(({ email, displayName, role, districtIds, branchIds }) => ({
  email, displayName, role, scope: [...districtIds, ...branchIds].join(", ") || "event",
})));
console.log(`Target: ${PROJECT_ID}; akun: ${accounts.length}; mode: ${apply ? "APPLY" : "DRY-RUN"}`);
if (!apply) process.exit(0);

const serviceAccount = JSON.parse(await readFile(credentialsPath, "utf8"));
if (serviceAccount.project_id !== PROJECT_ID && !args.has("--allow-cross-project-service-account")) {
  throw new Error(`Service account berasal dari proyek ${serviceAccount.project_id}. Tambahkan --allow-cross-project-service-account hanya jika IAM akun tersebut memang diberikan pada ${PROJECT_ID}.`);
}

initializeApp({ credential: cert(serviceAccount), projectId: PROJECT_ID });
const firestore = getFirestore();
const results = [];

async function createAuthUser(account) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(firebaseApiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: account.email,
      password: temporaryPassword,
      displayName: account.displayName,
      returnSecureToken: false,
    }),
  });
  const body = await response.json();
  if (!response.ok || !body.localId) {
    throw new Error(`Firebase Auth menolak ${account.email}: ${body?.error?.message ?? response.status}`);
  }
  return body.localId;
}

for (const account of accounts) {
  const existingUsers = await firestore.collection("users").where("email", "==", account.email).limit(1).get();
  let uid = existingUsers.empty ? null : existingUsers.docs[0].id;
  let created = false;
  if (!uid) {
    uid = await createAuthUser(account);
    created = true;
  }

  const userRef = firestore.doc(`users/${uid}`);
  const assignmentRef = firestore.doc(`roleAssignments/${uid}`);
  const existingUser = await userRef.get();
  const existingAssignment = await assignmentRef.get();
  const assignment = {
    role: account.role,
    eventId: EVENT_ID,
    status: "active",
    districtIds: account.districtIds,
    branchIds: account.branchIds,
  };
  const batch = firestore.batch();
  batch.set(userRef, {
    uid,
    email: account.email,
    displayName: account.displayName,
    status: "active",
    mustChangePassword: existingUser.exists ? existingUser.get("mustChangePassword") !== false : true,
    ...(existingUser.exists ? {} : { createdAt: Timestamp.now() }),
    updatedAt: Timestamp.now(),
  }, { merge: true });
  batch.set(assignmentRef, {
    assignments: [assignment],
    accessByEvent: {
      [EVENT_ID]: {
        roles: [account.role],
        districtIds: account.districtIds,
        branchIds: account.branchIds,
      },
    },
    disabled: false,
    revision: existingAssignment.exists ? Number(existingAssignment.get("revision") ?? 0) + 1 : 1,
    updatedAt: Timestamp.now(),
  }, { merge: true });
  batch.set(firestore.collection("adminAudit").doc(), {
    action: created ? "production_user_created" : "production_user_reconciled",
    actor: "trusted-local-bootstrap",
    targetUid: uid,
    targetEmail: account.email,
    eventId: EVENT_ID,
    role: account.role,
    districtIds: account.districtIds,
    branchIds: account.branchIds,
    idempotencyKey: `production-bootstrap:${EVENT_ID}:${account.email}`,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  results.push({ email: account.email, uid, result: created ? "created" : "existing" });
}

console.table(results);
console.log(`Selesai: ${results.filter((item) => item.result === "created").length} dibuat, ${results.filter((item) => item.result === "existing").length} direkonsiliasi.`);
