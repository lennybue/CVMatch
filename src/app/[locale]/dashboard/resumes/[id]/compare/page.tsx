import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/types/cv";
import { RESUME_VERSION_INCLUDE } from "@/lib/resumeQueries";
import { getVersionDisplayLabel } from "@/lib/versionLabel";
import { diffResumes, type ListEntryDiff } from "@/lib/resumeDiff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Change } from "diff";

export default async function CompareVersionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { id } = await params;
  const { a, b } = await searchParams;
  const session = await auth();
  const t = await getTranslations("compare");
  const tVersionLabel = await getTranslations("versionLabel");
  const tEditor = await getTranslations("editor");
  const tCommon = await getTranslations("common");

  if (!a || !b) {
    notFound();
  }

  const [versionA, versionB] = await Promise.all([
    prisma.resumeVersion.findFirst({
      where: { id: a, resumeId: id, resume: { userId: session!.user.id } },
      include: RESUME_VERSION_INCLUDE,
    }),
    prisma.resumeVersion.findFirst({
      where: { id: b, resumeId: id, resume: { userId: session!.user.id } },
      include: RESUME_VERSION_INCLUDE,
    }),
  ]);

  if (!versionA || !versionB) {
    notFound();
  }

  const cvA = CvDataSchema.parse(versionA.structuredData);
  const cvB = CvDataSchema.parse(versionB.structuredData);
  const diff = diffResumes(cvA, cvB);

  const labelA = getVersionDisplayLabel(versionA, (key, values) => tVersionLabel(key, values));
  const labelB = getVersionDisplayLabel(versionB, (key, values) => tVersionLabel(key, values));

  const listSections: {
    key: string;
    title: string;
    entries: ListEntryDiff<Record<string, unknown>>[];
    renderContent: (entry: Record<string, unknown>) => string;
  }[] = [
    {
      key: "experience",
      title: tEditor("experienceTitle"),
      entries: diff.experience as ListEntryDiff<Record<string, unknown>>[],
      renderContent: (e) => `${e.jobTitle} — ${e.company}`,
    },
    {
      key: "education",
      title: tEditor("educationTitle"),
      entries: diff.education as ListEntryDiff<Record<string, unknown>>[],
      renderContent: (e) => `${e.degree} — ${e.institution}`,
    },
    {
      key: "projects",
      title: tEditor("projectsTitle"),
      entries: diff.projects as ListEntryDiff<Record<string, unknown>>[],
      renderContent: (e) => String(e.name),
    },
    {
      key: "certificates",
      title: tEditor("certificatesTitle"),
      entries: diff.certificates as ListEntryDiff<Record<string, unknown>>[],
      renderContent: (e) => `${e.name} — ${e.issuer}`,
    },
    {
      key: "languages",
      title: tEditor("languagesTitle"),
      entries: diff.languages as ListEntryDiff<Record<string, unknown>>[],
      renderContent: (e) => `${e.name}${e.level ? ` (${e.level})` : ""}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <VersionSummaryCard
          title={t("versionA")}
          label={labelA}
          matchScore={versionA.matchScore}
          atsScore={versionA.atsScore}
          tCommon={tCommon}
        />
        <VersionSummaryCard
          title={t("versionB")}
          label={labelB}
          matchScore={versionB.matchScore}
          atsScore={versionB.atsScore}
          tCommon={tCommon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tEditor("summaryTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {diff.summaryChanged ? (
            <p className="text-sm leading-relaxed">
              <DiffText changes={diff.summaryDiff} />
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noChanges")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tEditor("skillsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {diff.skillsAdded.length === 0 && diff.skillsRemoved.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noChanges")}</p>
          ) : (
            <>
              {diff.skillsAdded.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium">{t("skillsAdded")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diff.skillsAdded.map((skill) => (
                      <Badge key={skill} className="border-success/30 bg-success/15 text-success">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {diff.skillsRemoved.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium">{t("skillsRemoved")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diff.skillsRemoved.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-destructive/30 text-destructive line-through"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {listSections.map((section) => {
        const changedEntries = section.entries.filter((e) => e.status !== "unchanged");
        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {changedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noChanges")}</p>
              ) : (
                changedEntries.map((entry) => (
                  <div key={entry.key} className="rounded-md border border-border p-3">
                    <div className="flex items-center gap-2">
                      {entry.status === "added" && (
                        <Badge className="border-success/30 bg-success/15 text-success">
                          {t("entryAdded")}
                        </Badge>
                      )}
                      {entry.status === "removed" && (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 text-destructive"
                        >
                          {t("entryRemoved")}
                        </Badge>
                      )}
                      <p className="text-sm font-medium">
                        {section.renderContent((entry.after ?? entry.before)!)}
                      </p>
                    </div>
                    {entry.bulletsDiff && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("bulletsChanged")}
                        </p>
                        {entry.bulletsDiff.map((part, i) => (
                          <p
                            key={i}
                            className={cn(
                              "whitespace-pre-wrap rounded px-1.5 py-0.5",
                              part.added && "bg-success/15 text-success",
                              part.removed && "bg-destructive/15 text-destructive line-through",
                            )}
                          >
                            {part.value}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DiffText({ changes }: { changes: Change[] }) {
  return (
    <>
      {changes.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added && "rounded bg-success/15 px-0.5 text-success",
            part.removed && "rounded bg-destructive/15 px-0.5 text-destructive line-through",
          )}
        >
          {part.value}
        </span>
      ))}
    </>
  );
}

function VersionSummaryCard({
  title,
  label,
  matchScore,
  atsScore,
  tCommon,
}: {
  title: string;
  label: string;
  matchScore: number | null;
  atsScore: number | null;
  tCommon: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{label}</p>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          {matchScore !== null && (
            <span>
              {tCommon("matchScore")}: {matchScore}
            </span>
          )}
          {atsScore !== null && (
            <span>
              {tCommon("atsScore")}: {atsScore}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
