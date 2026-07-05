import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationsBoard } from "./applications-board";

export default async function ApplicationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [applications, resumes] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resume: { select: { id: true, title: true } },
        resumeVersion: { select: { id: true, source: true, customLabel: true } },
      },
    }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  return <ApplicationsBoard initialApplications={applications} resumes={resumes} />;
}
