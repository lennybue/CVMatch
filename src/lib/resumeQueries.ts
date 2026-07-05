import { Prisma } from "@prisma/client";

/** Shared include shape so every place that lists resume versions can
 * compute display labels (source, job posting, restore lineage) consistently. */
export const RESUME_VERSION_INCLUDE = {
  jobPosting: { select: { title: true, company: true } },
  restoredFrom: {
    select: {
      source: true,
      customLabel: true,
      jobPosting: { select: { title: true, company: true } },
    },
  },
} satisfies Prisma.ResumeVersionInclude;

export const RESUME_WITH_VERSIONS_INCLUDE = {
  versions: {
    orderBy: { createdAt: "desc" },
    include: RESUME_VERSION_INCLUDE,
  },
  analyses: {
    orderBy: { createdAt: "desc" },
    include: { jobPosting: true },
  },
} satisfies Prisma.ResumeInclude;
