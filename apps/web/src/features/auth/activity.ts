import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export type ActivityAction = "login" | "profile_updated" | "password_changed";

export async function recordUserActivity(
  firestore: Firestore,
  uid: string,
  action: ActivityAction,
  summary: string,
) {
  await addDoc(collection(firestore, "users", uid, "activity"), {
    actorUid: uid,
    action,
    summary,
    createdAt: serverTimestamp(),
    source: "web",
  });
}
