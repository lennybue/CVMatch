"use client";

import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryEditor({
  summary,
  onChange,
}: {
  summary: string;
  onChange: (summary: string) => void;
}) {
  const t = useTranslations("editor");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("summaryTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          className="min-h-24"
          value={summary}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
