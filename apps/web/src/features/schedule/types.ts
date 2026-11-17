import type { Timestamp } from "firebase/firestore";

export type Venue = {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  status: "draft";
};

export type Schedule = {
  id: string;
  eventId: string;
  branchId: string;
  divisionId: string;
  venueId: string | null;
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  startAt?: Timestamp;
  endAt?: Timestamp;
  sessionNo?: string;
  description?: string;
  notes?: string;
  status: "draft";
  updatedAt?: Timestamp;
};
