import type { Prisma } from "@prisma/client";

export type ApplicationListItem = Prisma.ApplicationGetPayload<{
  include: {
    resume: { select: { id: true; title: true } };
    resumeVersion: { select: { id: true; source: true; customLabel: true } };
  };
}>;

export type ResumeOption = { id: string; title: string };
