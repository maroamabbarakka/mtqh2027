import type { Timestamp } from "firebase/firestore";

export type RegistrationStatus = "draft" | "submitted" | "under_review" | "verified" | "revision_required" | "rejected";
export type Registration = {
  id: string;
  eventId: string;
  districtId: string;
  branchId: string;
  divisionId: string;
  entryType: "individual" | "team";
  displayName: string;
  participantId: string | null;
  teamId: string | null;
  status: RegistrationStatus;
  eligibilityStatus: "needs_manual_review";
  createdBy: string;
  updatedBy: string;
  submittedBy?: string;
  submittedAt?: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewReason?: string;
  createdAt?: Timestamp;
};
