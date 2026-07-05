"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreBadge } from "@/components/score-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Download,
  Loader2,
  Sparkles,
  FileText,
  Pencil,
  RotateCcw,
  Briefcase,
  Trash2,
} from "lucide-react";
import type { CvData, AnalysisResult } from "@/types/cv";
import { getVersionDisplayLabel } from "@/lib/versionLabel";
import { useApiErrorMessage } from "@/lib/useApiErrorMessage";
import { RESUME_WITH_VERSIONS_INCLUDE } from "@/lib/resumeQueries";

type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: typeof RESUME_WITH_VERSIONS_INCLUDE;
}>;

export function ResumeWorkspace({
  initialResume,
}: {
  initialResume: ResumeWithRelations;
}) {
  const router = useRouter();
  const t = useTranslations("resumeWorkspace");
  const tVersionLabel = useTranslations("versionLabel");
  const tCommon = useTranslations("common");
  const getApiErrorMessage = useApiErrorMessage();

  const [resume, setResume] = useState(initialResume);
  const [jobText, setJobText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [pendingRestoreVersionId, setPendingRestoreVersionId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(null);
  const [pendingDeleteVersionId, setPendingDeleteVersionId] = useState<string | null>(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null);
  const [pendingDeleteAnalysisId, setPendingDeleteAnalysisId] = useState<string | null>(null);

  const cv = resume.structuredData as unknown as CvData;

  async function refetchResume() {
    const response = await fetch(`/api/resumes/${resume.id}`);
    if (response.ok) {
      const data = await response.json();
      setResume(data.resume);
    }
  }

  async function handleAnalyze() {
    if (jobText.trim().length < 50) {
      toast.error(t("jobTextTooShort"));
      return;
    }
    setIsAnalyzing(true);
    try {
      const jobResponse = await fetch("/api/job-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: jobText }),
      });
      const jobData = await jobResponse.json();
      if (!jobResponse.ok) {
        toast.error(getApiErrorMessage(jobData.error));
        return;
      }

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          jobPostingId: jobData.jobPosting.id,
        }),
      });
      const analyzeData = await analyzeResponse.json();
      if (!analyzeResponse.ok) {
        toast.error(getApiErrorMessage(analyzeData.error));
        return;
      }

      toast.success(t("analyzeSuccess"));
      setJobText("");
      await refetchResume();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleOptimize(analysisId: string) {
    setOptimizingId(analysisId);
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("optimizeSuccess"));
      await refetchResume();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setOptimizingId(null);
    }
  }

  async function performRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      const response = await fetch(`/api/resume-versions/${versionId}/restore`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("restoreSuccess"));
      await refetchResume();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setRestoringId(null);
      setPendingRestoreVersionId(null);
    }
  }

  async function performDeleteVersion(versionId: string) {
    setDeletingVersionId(versionId);
    try {
      const response = await fetch(`/api/resume-versions/${versionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("deleteVersionSuccess"));
      setResume((prev) => ({
        ...prev,
        versions: prev.versions.filter((v) => v.id !== versionId),
      }));
      setSelectedForCompare((prev) => prev.filter((id) => id !== versionId));
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setDeletingVersionId(null);
      setPendingDeleteVersionId(null);
    }
  }

  async function performDeleteAnalysis(analysisId: string) {
    setDeletingAnalysisId(analysisId);
    try {
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("deleteAnalysisSuccess"));
      setResume((prev) => ({
        ...prev,
        analyses: prev.analyses.filter((a) => a.id !== analysisId),
      }));
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setDeletingAnalysisId(null);
      setPendingDeleteAnalysisId(null);
    }
  }

  async function handleTrackApplication(version: ResumeWithRelations["versions"][number]) {
    setTrackingId(version.id);
    try {
      const company = version.jobPosting?.company || "";
      const jobTitle = version.jobPosting?.title || "";
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          resumeVersionId: version.id,
          jobPostingId: version.jobPostingId,
          company: company || "—",
          jobTitle: jobTitle || "—",
          status: "SAVED",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      router.push("/dashboard/applications");
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setTrackingId(null);
    }
  }

  function toggleCompareSelection(versionId: string) {
    setSelectedForCompare((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  }

  function handleCompare() {
    if (selectedForCompare.length !== 2) return;
    const [a, b] = selectedForCompare;
    router.push(`/dashboard/resumes/${resume.id}/compare?a=${a}&b=${b}`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{resume.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{resume.originalFileName}</p>
      </div>

      <CvOverview cv={cv} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("matchCardTitle")}</CardTitle>
          <CardDescription>{t("matchCardBody")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t("jobPostingPlaceholder")}
            className="min-h-40"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            disabled={isAnalyzing}
          />
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("analyzing")}
              </>
            ) : (
              t("analyze")
            )}
          </Button>
        </CardContent>
      </Card>

      {resume.analyses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">{t("analysesTitle")}</h2>
          {resume.analyses.map((analysis) => {
            const result = analysis as unknown as AnalysisResult & {
              id: string;
              jobPosting: { title: string | null; company: string | null };
            };
            return (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {analysis.jobPosting.title || t("untitledRole")}
                      {analysis.jobPosting.company
                        ? ` at ${analysis.jobPosting.company}`
                        : ""}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <ScoreBadge label={tCommon("matchScore")} score={analysis.matchScore} />
                      <ScoreBadge label={tCommon("atsScore")} score={analysis.atsScore} />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("deleteAnalysis")}
                        disabled={deletingAnalysisId === analysis.id}
                        onClick={() => setPendingDeleteAnalysisId(analysis.id)}
                      >
                        {deletingAnalysisId === analysis.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium">{t("matchingSkills")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchingSkills.length === 0 && (
                          <span className="text-sm text-muted-foreground">
                            {t("noneFound")}
                          </span>
                        )}
                        {result.matchingSkills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">{t("missingSkills")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.length === 0 && (
                          <span className="text-sm text-muted-foreground">
                            {t("greatFit")}
                          </span>
                        )}
                        {result.missingSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="border-destructive/30 text-destructive"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {result.suggestions.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">{t("suggestions")}</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {result.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  <Button
                    variant="secondary"
                    onClick={() => handleOptimize(analysis.id)}
                    disabled={optimizingId === analysis.id}
                  >
                    {optimizingId === analysis.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t("optimizing")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        {t("generateOptimized")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {resume.versions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-medium">{t("versionsTitle")}</h2>
            {resume.versions.length >= 2 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("compareSelectHint")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={selectedForCompare.length !== 2}
                  onClick={handleCompare}
                >
                  {t("compareAction")}
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {resume.versions.map((version, index) => {
              const label = getVersionDisplayLabel(version, tVersionLabel);
              const isLatest = index === 0;
              return (
                <Card key={version.id}>
                  <CardContent className="flex items-center gap-3 py-2">
                    {resume.versions.length >= 2 && (
                      <Checkbox
                        checked={selectedForCompare.includes(version.id)}
                        onCheckedChange={() => toggleCompareSelection(version.id)}
                        aria-label={label}
                      />
                    )}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{label}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {version.matchScore !== null && (
                          <ScoreBadge label={tCommon("matchScore")} score={version.matchScore} />
                        )}
                        {version.atsScore !== null && (
                          <ScoreBadge label={tCommon("atsScore")} score={version.atsScore} />
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {version.jobPostingId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("trackApplication")}
                          disabled={trackingId === version.id}
                          onClick={() => handleTrackApplication(version)}
                        >
                          {trackingId === version.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Briefcase className="size-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("editVersion")}
                        nativeButton={false}
                        render={
                          <Link href={`/dashboard/resumes/${resume.id}/versions/${version.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        }
                      />
                      {!isLatest && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("restoreVersion")}
                          disabled={restoringId === version.id}
                          onClick={() => setPendingRestoreVersionId(version.id)}
                        >
                          {restoringId === version.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <RotateCcw className="size-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={tCommon("download")}
                        nativeButton={false}
                        render={
                          <a href={`/api/resume-versions/${version.id}/pdf`} download>
                            <Download className="size-4" />
                          </a>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("deleteVersion")}
                        disabled={deletingVersionId === version.id}
                        onClick={() => setPendingDeleteVersionId(version.id)}
                      >
                        {deletingVersionId === version.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingRestoreVersionId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRestoreVersionId(null);
        }}
        title={t("restoreVersion")}
        description={t("restoreConfirm")}
        confirmLabel={t("restoreVersion")}
        isLoading={restoringId !== null}
        onConfirm={() => {
          if (pendingRestoreVersionId) performRestore(pendingRestoreVersionId);
        }}
      />

      <ConfirmDialog
        open={pendingDeleteVersionId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteVersionId(null);
        }}
        title={t("deleteVersion")}
        description={t("deleteVersionConfirm")}
        confirmLabel={tCommon("delete")}
        destructive
        isLoading={deletingVersionId !== null}
        onConfirm={() => {
          if (pendingDeleteVersionId) performDeleteVersion(pendingDeleteVersionId);
        }}
      />

      <ConfirmDialog
        open={pendingDeleteAnalysisId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteAnalysisId(null);
        }}
        title={t("deleteAnalysis")}
        description={t("deleteAnalysisConfirm")}
        confirmLabel={tCommon("delete")}
        destructive
        isLoading={deletingAnalysisId !== null}
        onConfirm={() => {
          if (pendingDeleteAnalysisId) performDeleteAnalysis(pendingDeleteAnalysisId);
        }}
      />
    </div>
  );
}

function CvOverview({ cv }: { cv: CvData }) {
  const t = useTranslations("resumeWorkspace");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("parsedResumeTitle")}</CardTitle>
        <CardDescription>
          {[cv.contact.email, cv.contact.phone, cv.contact.location]
            .filter(Boolean)
            .join(" · ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cv.summary && <p className="text-sm text-muted-foreground">{cv.summary}</p>}
        {cv.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}
        {cv.experience.length > 0 && (
          <ul className="space-y-1 text-sm">
            {cv.experience.map((exp, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="font-medium text-foreground">{exp.jobTitle}</span>
                {" @ "}
                {exp.company}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
