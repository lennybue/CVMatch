"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/dnd/sortable-list";
import { ResumePreview } from "@/components/resume-preview";
import { ContactEditor } from "@/components/editor/contact-editor";
import { SummaryEditor } from "@/components/editor/summary-editor";
import { SkillsEditor } from "@/components/editor/skills-editor";
import { ExperienceEditor } from "@/components/editor/experience-editor";
import { EducationEditor } from "@/components/editor/education-editor";
import { ProjectsEditor } from "@/components/editor/projects-editor";
import { CertificatesEditor } from "@/components/editor/certificates-editor";
import { LanguagesEditor } from "@/components/editor/languages-editor";
import { PresentationControls } from "@/components/editor/presentation-controls";
import { useApiErrorMessage } from "@/lib/useApiErrorMessage";
import { toEditableCv, fromEditableCv, type EditableCv } from "@/lib/editableCv";
import type { CvData } from "@/types/cv";
import type { Presentation, ResumeSectionKey } from "@/types/presentation";
import { RESUME_SECTION_KEYS } from "@/types/presentation";

export function ResumeEditor({
  resumeId,
  versionId,
  initialCv,
  initialPresentation,
}: {
  resumeId: string;
  versionId: string;
  initialCv: CvData;
  initialPresentation: Presentation;
}) {
  const router = useRouter();
  const t = useTranslations("editor");
  const tCommon = useTranslations("common");
  const getApiErrorMessage = useApiErrorMessage();

  const [editable, setEditable] = useState<EditableCv>(() => toEditableCv(initialCv));
  const [presentation, setPresentation] = useState<Presentation>(initialPresentation);
  const [isSaving, setIsSaving] = useState(false);

  const previewCv = useMemo(() => fromEditableCv(editable), [editable]);

  const sectionEditors: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <SummaryEditor
        summary={editable.summary}
        onChange={(summary) => setEditable((prev) => ({ ...prev, summary }))}
      />
    ),
    skills: (
      <SkillsEditor
        skills={editable.skills}
        onChange={(skills) => setEditable((prev) => ({ ...prev, skills }))}
      />
    ),
    experience: (
      <ExperienceEditor
        entries={editable.experience}
        onChange={(experience) => setEditable((prev) => ({ ...prev, experience }))}
      />
    ),
    education: (
      <EducationEditor
        entries={editable.education}
        onChange={(education) => setEditable((prev) => ({ ...prev, education }))}
      />
    ),
    projects: (
      <ProjectsEditor
        entries={editable.projects}
        onChange={(projects) => setEditable((prev) => ({ ...prev, projects }))}
      />
    ),
    certificates: (
      <CertificatesEditor
        entries={editable.certificates}
        onChange={(certificates) => setEditable((prev) => ({ ...prev, certificates }))}
      />
    ),
    languages: (
      <LanguagesEditor
        entries={editable.languages}
        onChange={(languages) => setEditable((prev) => ({ ...prev, languages }))}
      />
    ),
  };

  const orderedSections: ResumeSectionKey[] = [
    ...presentation.sectionOrder,
    ...RESUME_SECTION_KEYS.filter((key) => !presentation.sectionOrder.includes(key)),
  ];

  function reorderSections(newOrder: ResumeSectionKey[]) {
    setPresentation((prev) => ({ ...prev, sectionOrder: newOrder }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resume-versions/${versionId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredData: fromEditableCv(editable),
          presentation,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(getApiErrorMessage(data.error));
        return;
      }
      toast.success(t("saveSuccess"));
      router.push(`/dashboard/resumes/${resumeId}`);
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/dashboard/resumes/${resumeId}`}>{tCommon("cancel")}</Link>}
          />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {tCommon("saving")}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {t("saveAsNewVersion")}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <PresentationControls presentation={presentation} onChange={setPresentation} />
          <ContactEditor
            contact={editable.contact}
            onChange={(contact) => setEditable((prev) => ({ ...prev, contact }))}
          />

          <SortableList
            id="sections"
            items={orderedSections}
            getId={(key) => key}
            onReorder={reorderSections}
            renderItem={(key) => sectionEditors[key]}
          />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("livePreview")}</p>
          <ResumePreview cv={previewCv} presentation={presentation} />
        </div>
      </div>
    </div>
  );
}
