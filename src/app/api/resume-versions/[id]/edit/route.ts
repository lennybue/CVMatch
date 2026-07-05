import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { CvDataSchema } from "@/types/cv";
import { PresentationSchema } from "@/types/presentation";
import { RESUME_VERSION_INCLUDE } from "@/lib/resumeQueries";

const EditVersionSchema = z.object({
  structuredData: CvDataSchema,
  presentation: PresentationSchema,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const baseVersion = await prisma.resumeVersion.findFirst({
    where: { id, resume: { userId: session.user.id } },
  });

  if (!baseVersion) {
    return apiError("VERSION_NOT_FOUND");
  }

  const body = await request.json().catch(() => null);
  const parsed = EditVersionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR");
  }

  const edited = await prisma.resumeVersion.create({
    data: {
      resumeId: baseVersion.resumeId,
      jobPostingId: baseVersion.jobPostingId,
      analysisId: baseVersion.analysisId,
      source: "MANUAL_EDIT",
      isOriginal: false,
      structuredData: parsed.data.structuredData,
      presentation: parsed.data.presentation,
      atsScore: baseVersion.atsScore,
      matchScore: baseVersion.matchScore,
    },
    include: RESUME_VERSION_INCLUDE,
  });

  return NextResponse.json({ version: edited }, { status: 201 });
}
