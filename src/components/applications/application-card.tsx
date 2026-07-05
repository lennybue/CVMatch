"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ApplicationListItem } from "./types";

export function ApplicationCard({
  application,
  onClick,
}: {
  application: ApplicationListItem;
  onClick: () => void;
}) {
  const t = useTranslations("applications");
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer touch-none py-3 transition-shadow hover:shadow-md",
        isDragging && "z-10 opacity-60 shadow-lg",
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-1 px-3">
        <p className="text-sm font-medium">{application.jobTitle}</p>
        <p className="text-xs text-muted-foreground">{application.company}</p>
        {application.followUpDate && (
          <p className="text-xs text-warning">
            {t("followUpDate")}: {new Date(application.followUpDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
