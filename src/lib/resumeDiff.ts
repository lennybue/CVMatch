import { diffWords, diffLines, type Change } from "diff";
import type { CvData } from "@/types/cv";

export interface ListEntryDiff<T> {
  status: "added" | "removed" | "unchanged" | "changed";
  key: string;
  before?: T;
  after?: T;
  bulletsDiff?: Change[];
}

function diffByKey<T extends Record<string, unknown>>(
  before: T[],
  after: T[],
  keyFn: (item: T) => string,
  bulletsFn?: (item: T) => string[],
): ListEntryDiff<T>[] {
  const beforeMap = new Map(before.map((item) => [keyFn(item), item]));
  const afterMap = new Map(after.map((item) => [keyFn(item), item]));
  const results: ListEntryDiff<T>[] = [];

  for (const [key, beforeItem] of beforeMap) {
    const afterItem = afterMap.get(key);
    if (!afterItem) {
      results.push({ status: "removed", key, before: beforeItem });
      continue;
    }
    const beforeBullets = bulletsFn?.(beforeItem) ?? [];
    const afterBullets = bulletsFn?.(afterItem) ?? [];
    const bulletsChanged = beforeBullets.join("\n") !== afterBullets.join("\n");
    const otherFieldsChanged = JSON.stringify(beforeItem) !== JSON.stringify(afterItem);

    if (!bulletsChanged && !otherFieldsChanged) {
      results.push({ status: "unchanged", key, before: beforeItem, after: afterItem });
    } else {
      results.push({
        status: "changed",
        key,
        before: beforeItem,
        after: afterItem,
        bulletsDiff: bulletsChanged
          ? diffLines(beforeBullets.join("\n"), afterBullets.join("\n"))
          : undefined,
      });
    }
  }

  for (const [key, afterItem] of afterMap) {
    if (!beforeMap.has(key)) {
      results.push({ status: "added", key, after: afterItem });
    }
  }

  return results;
}

export interface ResumeDiffResult {
  summaryDiff: Change[];
  summaryChanged: boolean;
  skillsAdded: string[];
  skillsRemoved: string[];
  experience: ListEntryDiff<CvData["experience"][number]>[];
  education: ListEntryDiff<CvData["education"][number]>[];
  projects: ListEntryDiff<CvData["projects"][number]>[];
  certificates: ListEntryDiff<CvData["certificates"][number]>[];
  languages: ListEntryDiff<CvData["languages"][number]>[];
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function diffResumes(before: CvData, after: CvData): ResumeDiffResult {
  const skillsBefore = new Set(before.skills.map(normalize));
  const skillsAfter = new Set(after.skills.map(normalize));

  return {
    summaryDiff: diffWords(before.summary, after.summary),
    summaryChanged: before.summary.trim() !== after.summary.trim(),
    skillsAdded: after.skills.filter((s) => !skillsBefore.has(normalize(s))),
    skillsRemoved: before.skills.filter((s) => !skillsAfter.has(normalize(s))),
    experience: diffByKey(
      before.experience,
      after.experience,
      (e) => `${normalize(e.jobTitle)}::${normalize(e.company)}`,
      (e) => e.bullets,
    ),
    education: diffByKey(
      before.education,
      after.education,
      (e) => `${normalize(e.degree)}::${normalize(e.institution)}`,
      (e) => e.details,
    ),
    projects: diffByKey(
      before.projects,
      after.projects,
      (p) => normalize(p.name),
      (p) => p.bullets,
    ),
    certificates: diffByKey(
      before.certificates,
      after.certificates,
      (c) => `${normalize(c.name)}::${normalize(c.issuer)}`,
    ),
    languages: diffByKey(
      before.languages,
      after.languages,
      (l) => normalize(l.name),
    ),
  };
}
