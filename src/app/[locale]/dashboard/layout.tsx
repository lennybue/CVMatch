import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: "/login", locale });
  }
  const user = session!.user;

  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav userName={user.name ?? user.email ?? ""} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
