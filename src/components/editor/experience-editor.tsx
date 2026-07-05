"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SortableList } from "@/components/dnd/sortable-list";
import { newId, type IdItem, type EditableExperience } from "@/lib/editableCv";

export function ExperienceEditor({
  entries,
  onChange,
}: {
  entries: IdItem<EditableExperience>[];
  onChange: (entries: IdItem<EditableExperience>[]) => void;
}) {
  const t = useTranslations("editor");

  function updateEntry(id: string, patch: Partial<EditableExperience>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, value: { ...e.value, ...patch } } : e)));
  }

  function addEntry() {
    onChange([
      ...entries,
      {
        id: newId(),
        value: {
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          bullets: [],
        },
      },
    ]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("experienceTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SortableList
          id="experience"
          items={entries}
          getId={(item) => item.id}
          onReorder={onChange}
          renderItem={(entry) => (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{t("jobTitle")}</Label>
                    <Input
                      value={entry.value.jobTitle}
                      onChange={(e) => updateEntry(entry.id, { jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("company")}</Label>
                    <Input
                      value={entry.value.company}
                      onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
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
                        disabled={entry.value.isCurrent}
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

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={entry.value.isCurrent}
                  onCheckedChange={(checked) =>
                    updateEntry(entry.id, { isCurrent: checked === true })
                  }
                />
                {t("current")}
              </label>

              <Separator />

              <div className="space-y-2">
                <SortableList
                  id={`experience-bullets-${entry.id}`}
                  items={entry.value.bullets}
                  getId={(b) => b.id}
                  onReorder={(bullets) => updateEntry(entry.id, { bullets })}
                  renderItem={(bullet) => (
                    <div className="flex items-start gap-2">
                      <Textarea
                        className="min-h-9 flex-1 py-1.5"
                        value={bullet.value}
                        onChange={(e) =>
                          updateEntry(entry.id, {
                            bullets: entry.value.bullets.map((b) =>
                              b.id === bullet.id ? { ...b, value: e.target.value } : b,
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
                            bullets: entry.value.bullets.filter((b) => b.id !== bullet.id),
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
                      bullets: [...entry.value.bullets, { id: newId(), value: "" }],
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
          {t("addExperience")}
        </Button>
      </CardContent>
    </Card>
  );
}
