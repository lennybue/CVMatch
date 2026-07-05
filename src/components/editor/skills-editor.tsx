"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableList } from "@/components/dnd/sortable-list";
import { newId, type IdItem } from "@/lib/editableCv";

export function SkillsEditor({
  skills,
  onChange,
}: {
  skills: IdItem<string>[];
  onChange: (skills: IdItem<string>[]) => void;
}) {
  const t = useTranslations("editor");
  const [draft, setDraft] = useState("");

  function addSkill() {
    const value = draft.trim();
    if (!value) return;
    onChange([...skills, { id: newId(), value }]);
    setDraft("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("skillsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SortableList
          id="skills"
          items={skills}
          getId={(item) => item.id}
          onReorder={onChange}
          renderItem={(item) => (
            <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
              <Input
                className="h-7 border-none px-1 shadow-none focus-visible:ring-0"
                value={item.value}
                onChange={(e) =>
                  onChange(
                    skills.map((s) =>
                      s.id === item.id ? { ...s, value: e.target.value } : s,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("removeItem")}
                onClick={() => onChange(skills.filter((s) => s.id !== item.id))}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        />
        <div className="flex gap-2">
          <Input
            placeholder={t("skillsTitle")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            <Plus className="size-4" />
            {t("addSkill")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
