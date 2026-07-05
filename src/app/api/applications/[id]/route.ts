import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { UpdateApplicationSchema } from "@/types/application";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) {
    return apiError("APPLICATION_NOT_FOUND");
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR");
  }

  const { appliedDate, interviewDate, followUpDate, ...rest } = parsed.data;

  const application = await prisma.application.update({
    where: { id },
    data: {
      ...rest,
      ...(appliedDate !== undefined && {
        appliedDate: appliedDate ? new Date(appliedDate) : null,
      }),
      ...(interviewDate !== undefined && {
        interviewDate: interviewDate ? new Date(interviewDate) : null,
      }),
      ...(followUpDate !== undefined && {
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      }),
    },
    include: {
      resume: { select: { id: true, title: true } },
      resumeVersion: { select: { id: true, source: true, customLabel: true } },
    },
  });

  return NextResponse.json({ application });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) {
    return apiError("APPLICATION_NOT_FOUND");
  }

  await prisma.application.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
