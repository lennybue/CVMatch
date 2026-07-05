"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableList } from "@/components/dnd/sortable-list";
import { newId, type IdItem } from "@/lib/editableCv";
import type { CvData } from "@/types/cv";

type LanguageEntry = CvData["languages"][number];

export function LanguagesEditor({
  entries,
  onChange,
}: {
  entries: IdItem<LanguageEntry>[];
  onChange: (entries: IdItem<LanguageEntry>[]) => void;
}) {
  const t = useTranslations("editor");

  function updateEntry(id: string, patch: Partial<LanguageEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, value: { ...e.value, ...patch } } : e)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("languagesTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SortableList
          id="languages"
          items={entries}
          getId={(item) => item.id}
          onReorder={onChange}
          renderItem={(entry) => (
            <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-1.5">
                <Label>{t("languageName")}</Label>
                <Input
                  value={entry.value.name}
                  onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("level")}</Label>
                <Input
                  value={entry.value.level}
                  onChange={(e) => updateEntry(entry.id, { level: e.target.value })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                aria-label={t("removeItem")}
                onClick={() => onChange(entries.filter((e) => e.id !== entry.id))}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([...entries, { id: newId(), value: { name: "", level: "" } }])}
        >
          <Plus className="size-4" />
          {t("addLanguage")}
        </Button>
      </CardContent>
    </Card>
  );
}
