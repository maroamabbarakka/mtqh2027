export type ResultWinner = {
  awardId: string;
  entryId: string;
};

export type ResultSubmissionInput = {
  branchId: string;
  divisionId: string;
  winners: ResultWinner[];
  sourceDocumentNumber: string;
  establishedAt: string;
  notes: string;
};

export type ResultSubmissionStatus = "draft" | "submitted" | "needs_revision" | "approved" | "superseded";

export type ResultSubmission = ResultSubmissionInput & {
  id: string;
  eventId: string;
  status: ResultSubmissionStatus;
  revision: number;
  createdBy: string;
};
