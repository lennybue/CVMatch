"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useApiErrorMessage } from "@/lib/useApiErrorMessage";

export interface ResumeListItem {
  id: string;
  title: string;
  originalFileName: string;
  _count: { versions: number; analyses: number };
}

export function ResumeList({ initialResumes }: { initialResumes: ResumeListItem[] }) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const getApiErrorMessage = useApiErrorMessage();

  const [resumes, setResumes] = useState(initialResumes);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function performDelete(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("deleteResumeSuccess"));
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  if (resumes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {resumes.map((resume) => (
        <Card key={resume.id} className="h-full transition-colors hover:border-primary/50">
          <CardContent className="flex items-start gap-3 py-2">
            <Link href={`/dashboard/resumes/${resume.id}`} className="flex min-w-0 flex-1 gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{resume.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {resume.originalFileName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("versionsCount", { count: resume._count.versions })} ·{" "}
                  {t("analysesCount", { count: resume._count.analyses })}
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={t("deleteResume")}
              disabled={deletingId === resume.id}
              onClick={() => setPendingDeleteId(resume.id)}
            >
              {deletingId === resume.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title={t("deleteResume")}
        description={t("deleteResumeConfirm")}
        confirmLabel={tCommon("delete")}
        destructive
        isLoading={deletingId !== null}
        onConfirm={() => {
          if (pendingDeleteId) performDelete(pendingDeleteId);
        }}
      />
    </div>
  );
}
