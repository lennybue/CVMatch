"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CvData } from "@/types/cv";

export function ContactEditor({
  contact,
  onChange,
}: {
  contact: CvData["contact"];
  onChange: (contact: CvData["contact"]) => void;
}) {
  const t = useTranslations("editor");

  function update<K extends keyof CvData["contact"]>(key: K, value: CvData["contact"][K]) {
    onChange({ ...contact, [key]: value });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("contactTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("fullName")}</Label>
            <Input
              value={contact.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("email")}</Label>
            <Input value={contact.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("phone")}</Label>
            <Input value={contact.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("location")}</Label>
            <Input
              value={contact.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          {contact.links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="LinkedIn"
                value={link.label}
                onChange={(e) => {
                  const links = [...contact.links];
                  links[i] = { ...links[i], label: e.target.value };
                  update("links", links);
                }}
              />
              <Input
                placeholder="https://…"
                value={link.url}
                onChange={(e) => {
                  const links = [...contact.links];
                  links[i] = { ...links[i], url: e.target.value };
                  update("links", links);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("removeItem")}
                onClick={() => update("links", contact.links.filter((_, idx) => idx !== i))}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update("links", [...contact.links, { label: "", url: "" }])}
          >
            <Plus className="size-4" />
            {t("addLink")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
