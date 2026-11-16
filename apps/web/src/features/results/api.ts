import type { Auth } from "firebase/auth";

export type ResultAction = "submit" | "start_review" | "return" | "approve";

export async function transitionResult(auth: Auth, eventId: string, resultId: string, action: ResultAction, reason?: string) {
  const baseUrl = import.meta.env.VITE_WORKER_API_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("worker_not_configured");
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("missing_token");
  const response = await fetch(`${baseUrl}/v1/events/${eventId}/results/${resultId}/transition`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), action, ...(reason ? { reason } : {}) }),
  });
  const payload = await response.json() as { success: boolean; error?: { code?: string } };
  if (!response.ok || !payload.success) throw new Error(payload.error?.code ?? "result_transition_failed");
  return payload;
}
