import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/types/cv";
import { DEFAULT_PRESENTATION, PresentationSchema } from "@/types/presentation";
import { ResumeEditor } from "./resume-editor";

export default async function EditResumeVersionPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const { id, versionId } = await params;
  const session = await auth();

  const version = await prisma.resumeVersion.findFirst({
    where: { id: versionId, resumeId: id, resume: { userId: session!.user.id } },
    include: { resume: { select: { id: true, title: true } } },
  });

  if (!version) {
    notFound();
  }

  const cv = CvDataSchema.parse(version.structuredData);
  const presentation = version.presentation
    ? PresentationSchema.parse(version.presentation)
    : DEFAULT_PRESENTATION;

  return (
    <ResumeEditor
      resumeId={version.resume.id}
      versionId={version.id}
      initialCv={cv}
      initialPresentation={presentation}
    />
  );
}
