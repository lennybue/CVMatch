"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SortableList } from "@/components/dnd/sortable-list";
import { newId, type IdItem, type EditableEducation } from "@/lib/editableCv";

export function EducationEditor({
  entries,
  onChange,
}: {
  entries: IdItem<EditableEducation>[];
  onChange: (entries: IdItem<EditableEducation>[]) => void;
}) {
  const t = useTranslations("editor");

  function updateEntry(id: string, patch: Partial<EditableEducation>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, value: { ...e.value, ...patch } } : e)));
  }

  function addEntry() {
    onChange([
      ...entries,
      {
        id: newId(),
        value: {
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          details: [],
        },
      },
    ]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("educationTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SortableList
          id="education"
          items={entries}
          getId={(item) => item.id}
          onReorder={onChange}
          renderItem={(entry) => (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{t("degree")}</Label>
                    <Input
                      value={entry.value.degree}
                      onChange={(e) => updateEntry(entry.id, { degree: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("institution")}</Label>
                    <Input
                      value={entry.value.institution}
                      onChange={(e) => updateEntry(entry.id, { institution: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("location")}</Label>
                    <Input
                      value={entry.value.location}
                      onChange={(e) => updateEntry(entry.id, { location: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label>{t("startDate")}</Label>
                      <Input
                        value={entry.value.startDate}
                        onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label>{t("endDate")}</Label>
                      <Input
                        value={entry.value.endDate}
                        onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("removeItem")}
                  onClick={() => onChange(entries.filter((e) => e.id !== entry.id))}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <SortableList
                  id={`education-details-${entry.id}`}
                  items={entry.value.details}
                  getId={(d) => d.id}
                  onReorder={(details) => updateEntry(entry.id, { details })}
                  renderItem={(detail) => (
                    <div className="flex items-start gap-2">
                      <Textarea
                        className="min-h-9 flex-1 py-1.5"
                        value={detail.value}
                        onChange={(e) =>
                          updateEntry(entry.id, {
                            details: entry.value.details.map((d) =>
                              d.id === detail.id ? { ...d, value: e.target.value } : d,
                            ),
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("removeItem")}
                        onClick={() =>
                          updateEntry(entry.id, {
                            details: entry.value.details.filter((d) => d.id !== detail.id),
                          })
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateEntry(entry.id, {
                      details: [...entry.value.details, { id: newId(), value: "" }],
                    })
                  }
                >
                  <Plus className="size-4" />
                  {t("addBullet")}
                </Button>
              </div>
            </div>
          )}
        />
        <Button type="button" variant="outline" onClick={addEntry}>
          <Plus className="size-4" />
          {t("addEducation")}
        </Button>
      </CardContent>
    </Card>
  );
}
