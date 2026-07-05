import type { ApplicationStatus } from "@/types/application";

export const STATUS_LABEL_KEY: Record<
  ApplicationStatus,
  "statusSaved" | "statusApplied" | "statusInterviewing" | "statusOffer" | "statusRejected" | "statusWithdrawn"
> = {
  SAVED: "statusSaved",
  APPLIED: "statusApplied",
  INTERVIEWING: "statusInterviewing",
  OFFER: "statusOffer",
  REJECTED: "statusRejected",
  WITHDRAWN: "statusWithdrawn",
};
