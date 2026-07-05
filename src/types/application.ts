import { z } from "zod";

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const CreateApplicationSchema = z.object({
  resumeId: z.string(),
  resumeVersionId: z.string().nullable().optional(),
  jobPostingId: z.string().nullable().optional(),
  company: z.string().min(1).max(200),
  jobTitle: z.string().min(1).max(200),
  status: z.enum(APPLICATION_STATUSES).default("SAVED"),
  appliedDate: z.string().nullable().optional(),
  interviewDate: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const UpdateApplicationSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  jobTitle: z.string().min(1).max(200).optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  appliedDate: z.string().nullable().optional(),
  interviewDate: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});
