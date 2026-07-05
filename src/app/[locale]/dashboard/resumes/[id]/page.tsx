import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RESUME_WITH_VERSIONS_INCLUDE } from "@/lib/resumeQueries";
import { ResumeWorkspace } from "./resume-workspace";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session!.user.id },
    include: RESUME_WITH_VERSIONS_INCLUDE,
  });

  if (!resume) {
    notFound();
  }

  return <ResumeWorkspace initialResume={resume} />;
}
