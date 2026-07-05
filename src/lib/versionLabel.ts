import type { VersionSource } from "@prisma/client";

type JobPostingLite = { title: string | null; company: string | null } | null | undefined;

export interface VersionLabelInput {
  source: VersionSource;
  customLabel: string | null;
  jobPosting?: JobPostingLite;
  restoredFrom?: VersionLabelInput | null;
}

type Translate = (key: string, values?: Record<string, string>) => string;

export function getVersionDisplayLabel(version: VersionLabelInput, t: Translate): string {
  if (version.customLabel) return version.customLabel;

  switch (version.source) {
    case "ORIGINAL":
      return t("original");
    case "MANUAL_EDIT":
      return t("manualEdit");
    case "RESTORED": {
      const sourceLabel = version.restoredFrom
        ? getVersionDisplayLabel(version.restoredFrom, t)
        : t("original");
      return t("restored", { source: sourceLabel });
    }
    case "AI_OPTIMIZED":
    default: {
      const target = version.jobPosting?.title || version.jobPosting?.company;
      return target ? t("aiOptimized", { target }) : t("aiOptimizedGeneric");
    }
  }
}
