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
import { newId, type IdItem, type EditableProject } from "@/lib/editableCv";

export function ProjectsEditor({
  entries,
  onChange,
}: {
  entries: IdItem<EditableProject>[];
  onChange: (entries: IdItem<EditableProject>[]) => void;
}) {
  const t = useTranslations("editor");

  function updateEntry(id: string, patch: Partial<EditableProject>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, value: { ...e.value, ...patch } } : e)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("projectsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SortableList
          id="projects"
          items={entries}
          getId={(item) => item.id}
          onReorder={onChange}
          renderItem={(entry) => (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <Label>{t("projectName")}</Label>
                    <Input
                      value={entry.value.name}
                      onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("description")}</Label>
                    <Textarea
                      value={entry.value.description}
                      onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                    />
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
                  id={`project-bullets-${entry.id}`}
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
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange([
              ...entries,
              { id: newId(), value: { name: "", description: "", link: "", bullets: [] } },
            ])
          }
        >
          <Plus className="size-4" />
          {t("addProject")}
        </Button>
      </CardContent>
    </Card>
  );
}
