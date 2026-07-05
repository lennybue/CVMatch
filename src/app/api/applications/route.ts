import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { CreateApplicationSchema } from "@/types/application";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      resume: { select: { id: true, title: true } },
      resumeVersion: { select: { id: true, source: true, customLabel: true } },
    },
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR");
  }

  const resume = await prisma.resume.findFirst({
    where: { id: parsed.data.resumeId, userId: session.user.id },
    select: { id: true },
  });
  if (!resume) {
    return apiError("RESUME_NOT_FOUND");
  }

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      resumeId: parsed.data.resumeId,
      resumeVersionId: parsed.data.resumeVersionId ?? null,
      jobPostingId: parsed.data.jobPostingId ?? null,
      company: parsed.data.company,
      jobTitle: parsed.data.jobTitle,
      status: parsed.data.status,
      appliedDate: parsed.data.appliedDate ? new Date(parsed.data.appliedDate) : null,
      interviewDate: parsed.data.interviewDate
        ? new Date(parsed.data.interviewDate)
        : null,
      followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null,
      notes: parsed.data.notes ?? null,
    },
    include: {
      resume: { select: { id: true, title: true } },
      resumeVersion: { select: { id: true, source: true, customLabel: true } },
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
