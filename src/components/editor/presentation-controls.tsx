"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ACCENT_COLOR_SWATCHES,
  FONT_FAMILIES,
  TEMPLATES,
  type Presentation,
} from "@/types/presentation";

export function PresentationControls({
  presentation,
  onChange,
}: {
  presentation: Presentation;
  onChange: (presentation: Presentation) => void;
}) {
  const t = useTranslations("editor");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("presentationTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("template")}</Label>
            <Select
              value={presentation.template}
              onValueChange={(value) => {
                if (!value) return;
                onChange({ ...presentation, template: value as Presentation["template"] });
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: Presentation["template"]) =>
                    value === "modern" ? t("templateModern") : t("templateCompact")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template === "modern" ? t("templateModern") : t("templateCompact")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("fontFamily")}</Label>
            <Select
              value={presentation.fontFamily}
              onValueChange={(value) => {
                if (!value) return;
                onChange({ ...presentation, fontFamily: value as Presentation["fontFamily"] });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("accentColor")}</Label>
          <div className="flex gap-2">
            {ACCENT_COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                className="flex size-7 items-center justify-center rounded-full border border-border"
                style={{ backgroundColor: color }}
                onClick={() => onChange({ ...presentation, accentColor: color })}
              >
                {presentation.accentColor === color && (
                  <Check className={cn("size-4 text-white")} />
                )}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
