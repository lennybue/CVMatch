import { getTranslations, getFormatter } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload, Briefcase, Target, Gauge, Sparkles } from "lucide-react";
import { ResumeList } from "./resume-list";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const t = await getTranslations("dashboard");
  const format = await getFormatter();

  const [resumes, applicationCount, scoreAverages, lastOptimized] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { versions: true, analyses: true } },
      },
    }),
    prisma.application.count({ where: { userId } }),
    prisma.resumeVersion.aggregate({
      where: { resume: { userId }, matchScore: { not: null } },
      _avg: { matchScore: true, atsScore: true },
    }),
    prisma.resumeVersion.findFirst({
      where: { resume: { userId }, source: "AI_OPTIMIZED" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/dashboard/resumes/new">
              <Plus className="size-4" />
              {t("uploadResume")}
            </Link>
          }
        />
      </div>

      {resumes.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Briefcase className="size-4" />}
            label={t("statsApplications")}
            value={String(applicationCount)}
          />
          <StatCard
            icon={<Target className="size-4" />}
            label={t("statsAvgMatch")}
            value={
              scoreAverages._avg.matchScore != null
                ? Math.round(scoreAverages._avg.matchScore).toString()
                : "—"
            }
          />
          <StatCard
            icon={<Gauge className="size-4" />}
            label={t("statsAvgAts")}
            value={
              scoreAverages._avg.atsScore != null
                ? Math.round(scoreAverages._avg.atsScore).toString()
                : "—"
            }
          />
          <StatCard
            icon={<Sparkles className="size-4" />}
            label={t("statsLastOptimized")}
            value={
              lastOptimized
                ? format.dateTime(lastOptimized.createdAt, { dateStyle: "medium" })
                : "—"
            }
          />
        </div>
      )}

      {resumes.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-6" />
            </div>
            <h2 className="font-medium">{t("emptyTitle")}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("emptyBody")}</p>
            <Button
              className="mt-2"
              nativeButton={false}
              render={<Link href="/dashboard/resumes/new">{t("uploadFirstResume")}</Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <ResumeList initialResumes={resumes} />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-1.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
