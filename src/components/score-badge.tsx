import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 75) return "bg-success/15 text-success border-success/30";
  if (score >= 50) return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

export function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", scoreTone(score))}>
      {label}: {score}
    </Badge>
  );
}
