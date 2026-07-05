"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ApplicationCard } from "./application-card";
import type { ApplicationListItem } from "./types";
import type { ApplicationStatus } from "@/types/application";

export function KanbanColumn({
  status,
  title,
  applications,
  onCardClick,
}: {
  status: ApplicationStatus;
  title: string;
  applications: ApplicationListItem[];
  onCardClick: (application: ApplicationListItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-40 w-64 shrink-0 flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2.5 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-xs text-muted-foreground">{applications.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onClick={() => onCardClick(application)}
          />
        ))}
      </div>
    </div>
  );
}
