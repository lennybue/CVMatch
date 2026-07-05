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

type Certificate = CvData["certificates"][number];

export function CertificatesEditor({
  entries,
  onChange,
}: {
  entries: IdItem<Certificate>[];
  onChange: (entries: IdItem<Certificate>[]) => void;
}) {
  const t = useTranslations("editor");

  function updateEntry(id: string, patch: Partial<Certificate>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, value: { ...e.value, ...patch } } : e)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("certificatesTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SortableList
          id="certificates"
          items={entries}
          getId={(item) => item.id}
          onReorder={onChange}
          renderItem={(entry) => (
            <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
              <div className="space-y-1.5">
                <Label>{t("certName")}</Label>
                <Input
                  value={entry.value.name}
                  onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("issuer")}</Label>
                <Input
                  value={entry.value.issuer}
                  onChange={(e) => updateEntry(entry.id, { issuer: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("date")}</Label>
                <Input
                  className="w-24"
                  value={entry.value.date}
                  onChange={(e) => updateEntry(entry.id, { date: e.target.value })}
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
          onClick={() =>
            onChange([...entries, { id: newId(), value: { name: "", issuer: "", date: "" } }])
          }
        >
          <Plus className="size-4" />
          {t("addCertificate")}
        </Button>
      </CardContent>
    </Card>
  );
}
