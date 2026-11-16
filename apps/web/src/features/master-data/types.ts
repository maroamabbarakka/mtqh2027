import type { Timestamp } from "firebase/firestore";

export type EventConfiguration = {
  id: string;
  name: string;
  year: number;
  timezone: string;
  stage: "draft" | "active" | "closed";
  decisionsStatus: string;
  updatedAt?: Timestamp;
};
export type District = {
  id: string;
  name: string;
  status: "official-reference";
};
export type Branch = {
  id: string;
  eventId: string;
  name: string;
  shortName: string;
  description: string;
  status: "draft";
  enabled: boolean;
  revision: number;
  updatedAt?: Timestamp;
};
export type Division = {
  id: string;
  eventId: string;
  branchId: string;
  name: string;
  gender: string;
  teamMode: "individual" | "team";
  status: "draft";
  enabled: boolean;
  limitsStatus: "draft_awaiting_juknis";
  awardSlots: Array<{ id: string; label: string }>;
  awardSlotsStatus: "draft";
  revision: number;
  updatedAt?: Timestamp;
};
