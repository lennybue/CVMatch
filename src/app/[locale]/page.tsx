import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { FileText, Target, Sparkles } from "lucide-react";

export default async function Home() {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">CVMatch</span>
        <nav className="flex items-center gap-3">
          <LocaleSwitcher />
          <Button nativeButton={false} render={<Link href="/dashboard">{tNav("dashboard")}</Link>} />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pt-16 pb-24 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {t.rich("title", {
            accent: (chunks) => <span className="text-primary">{chunks}</span>,
          })}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-10 flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/dashboard">{t("cta")}</Link>} />
        </div>

        <div className="mt-24 grid w-full gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<FileText className="size-5" />}
            title={t("feature1Title")}
            description={t("feature1Body")}
          />
          <FeatureCard
            icon={<Target className="size-5" />}
            title={t("feature2Title")}
            description={t("feature2Body")}
          />
          <FeatureCard
            icon={<Sparkles className="size-5" />}
            title={t("feature3Title")}
            description={t("feature3Body")}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-left">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
