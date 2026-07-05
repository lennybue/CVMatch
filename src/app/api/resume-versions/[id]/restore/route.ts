import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { RESUME_VERSION_INCLUDE } from "@/lib/resumeQueries";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const target = await prisma.resumeVersion.findFirst({
    where: { id, resume: { userId: session.user.id } },
  });

  if (!target) {
    return apiError("VERSION_NOT_FOUND");
  }

  // Non-destructive: restoring never deletes or overwrites history, it
  // creates a new version carrying the old content forward as the latest.
  const restored = await prisma.resumeVersion.create({
    data: {
      resumeId: target.resumeId,
      jobPostingId: target.jobPostingId,
      analysisId: target.analysisId,
      restoredFromVersionId: target.id,
      source: "RESTORED",
      isOriginal: false,
      structuredData: target.structuredData as object,
      presentation: target.presentation ?? undefined,
      atsScore: target.atsScore,
      matchScore: target.matchScore,
    },
    include: RESUME_VERSION_INCLUDE,
  });

  return NextResponse.json({ version: restored }, { status: 201 });
}
