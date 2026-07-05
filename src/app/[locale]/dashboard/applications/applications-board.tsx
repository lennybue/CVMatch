"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanColumn } from "@/components/applications/kanban-column";
import { ApplicationDialog } from "@/components/applications/application-dialog";
import { STATUS_LABEL_KEY } from "@/components/applications/status";
import { useApiErrorMessage } from "@/lib/useApiErrorMessage";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types/application";
import type { ApplicationListItem, ResumeOption } from "@/components/applications/types";

export function ApplicationsBoard({
  initialApplications,
  resumes,
}: {
  initialApplications: ApplicationListItem[];
  resumes: ResumeOption[];
}) {
  const t = useTranslations("applications");
  const tCommon = useTranslations("common");
  const getApiErrorMessage = useApiErrorMessage();

  const [applications, setApplications] = useState(initialApplications);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ApplicationListItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const applicationId = String(active.id);
    const newStatus = over.id as ApplicationStatus;
    const current = applications.find((a) => a.id === applicationId);
    if (!current || current.status === newStatus) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)),
    );

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(getApiErrorMessage(data.error));
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? current : a)),
        );
      }
    } catch {
      toast.error(tCommon("somethingWentWrong"));
      setApplications((prev) => prev.map((a) => (a.id === applicationId ? current : a)));
    }
  }

  function handleSaved(application: ApplicationListItem) {
    setApplications((prev) => {
      const exists = prev.some((a) => a.id === application.id);
      return exists
        ? prev.map((a) => (a.id === application.id ? application : a))
        : [application, ...prev];
    });
  }

  function handleDeleted(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {applications.length > 0 && resumes.length > 0 && (
          <Button
            onClick={() => {
              setEditingApplication(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t("addApplication")}
          </Button>
        )}
      </div>

      {resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </div>
            <h2 className="font-medium">{t("emptyTitle")}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("emptyBody")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {applications.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="size-6" />
                </div>
                <h2 className="font-medium">{t("emptyTitle")}</h2>
                <p className="max-w-sm text-sm text-muted-foreground">{t("emptyBody")}</p>
                <Button
                  className="mt-2"
                  onClick={() => {
                    setEditingApplication(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  {t("addApplication")}
                </Button>
              </CardContent>
            </Card>
          )}

          <DndContext id="applications-kanban" sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {APPLICATION_STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  title={t(STATUS_LABEL_KEY[status])}
                  applications={applications.filter((a) => a.status === status)}
                  onCardClick={(application) => {
                    setEditingApplication(application);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </DndContext>
        </>
      )}

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editingApplication}
        resumes={resumes}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
