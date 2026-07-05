"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiErrorMessage } from "@/lib/useApiErrorMessage";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types/application";
import { STATUS_LABEL_KEY } from "./status";
import type { ApplicationListItem, ResumeOption } from "./types";

type FormState = {
  resumeId: string;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string;
  interviewDate: string;
  followUpDate: string;
  notes: string;
};

function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function initialFormState(
  application: ApplicationListItem | null,
  defaultResumeId: string,
): FormState {
  if (!application) {
    return {
      resumeId: defaultResumeId,
      company: "",
      jobTitle: "",
      status: "SAVED",
      appliedDate: "",
      interviewDate: "",
      followUpDate: "",
      notes: "",
    };
  }
  return {
    resumeId: application.resumeId,
    company: application.company,
    jobTitle: application.jobTitle,
    status: application.status,
    appliedDate: toDateInputValue(application.appliedDate),
    interviewDate: toDateInputValue(application.interviewDate),
    followUpDate: toDateInputValue(application.followUpDate),
    notes: application.notes ?? "",
  };
}

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
  resumes,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ApplicationListItem | null;
  resumes: ResumeOption[];
  onSaved: (application: ApplicationListItem) => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {/* Keying by the open target remounts the form with fresh initial
            state whenever a different application (or "new") is opened,
            avoiding an effect-based state sync. */}
        <ApplicationForm
          key={open ? (application?.id ?? "new") : "closed"}
          application={application}
          resumes={resumes}
          onSaved={onSaved}
          onDeleted={onDeleted}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ApplicationForm({
  application,
  resumes,
  onSaved,
  onDeleted,
  onClose,
}: {
  application: ApplicationListItem | null;
  resumes: ResumeOption[];
  onSaved: (application: ApplicationListItem) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("applications");
  const tCommon = useTranslations("common");
  const getApiErrorMessage = useApiErrorMessage();
  const [form, setForm] = useState<FormState>(() =>
    initialFormState(application, resumes[0]?.id ?? ""),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEditing = Boolean(application);

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = isEditing ? `/api/applications/${application!.id}` : "/api/applications";
      const method = isEditing ? "PATCH" : "POST";
      const body = isEditing
        ? {
            company: form.company,
            jobTitle: form.jobTitle,
            status: form.status,
            appliedDate: form.appliedDate || null,
            interviewDate: form.interviewDate || null,
            followUpDate: form.followUpDate || null,
            notes: form.notes || null,
          }
        : {
            resumeId: form.resumeId,
            company: form.company,
            jobTitle: form.jobTitle,
            status: form.status,
            appliedDate: form.appliedDate || null,
            interviewDate: form.interviewDate || null,
            followUpDate: form.followUpDate || null,
            notes: form.notes || null,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(isEditing ? t("updateSuccess") : t("createSuccess"));
      onSaved(data.application);
      onClose();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!application) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("deleteSuccess"));
      onDeleted(application.id);
      onClose();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? t("editTitle") : t("createTitle")}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {!isEditing && (
          <div className="space-y-1.5">
            <Label>{t("linkedResume")}</Label>
            <Select
              value={form.resumeId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, resumeId: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    resumes.find((resume) => resume.id === value)?.title ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("company")}</Label>
            <Input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("jobTitle")}</Label>
            <Input
              value={form.jobTitle}
              onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("status")}</Label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              value && setForm((f) => ({ ...f, status: value as ApplicationStatus }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: ApplicationStatus) => t(STATUS_LABEL_KEY[value])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(STATUS_LABEL_KEY[status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("appliedDate")}</Label>
            <Input
              type="date"
              value={form.appliedDate}
              onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("interviewDate")}</Label>
            <Input
              type="date"
              value={form.interviewDate}
              onChange={(e) => setForm((f) => ({ ...f, interviewDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("followUpDate")}</Label>
            <Input
              type="date"
              value={form.followUpDate}
              onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("notes")}</Label>
          <Textarea
            placeholder={t("notesPlaceholder")}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        {isEditing ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => setConfirmingDelete(true)}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {tCommon("delete")}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            disabled={isSaving || !form.company || !form.jobTitle}
            onClick={handleSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {tCommon("save")}
          </Button>
        </div>
      </DialogFooter>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={tCommon("delete")}
        description={t("deleteConfirm")}
        confirmLabel={tCommon("delete")}
        destructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
