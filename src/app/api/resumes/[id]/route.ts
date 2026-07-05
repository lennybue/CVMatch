import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";
import { RESUME_WITH_VERSIONS_INCLUDE } from "@/lib/resumeQueries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: RESUME_WITH_VERSIONS_INCLUDE,
  });

  if (!resume) {
    return apiError("RESUME_NOT_FOUND");
  }

  return NextResponse.json({ resume });
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

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!resume) {
    return apiError("RESUME_NOT_FOUND");
  }

  await prisma.resume.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
