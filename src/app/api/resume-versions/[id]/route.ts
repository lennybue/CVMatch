import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiError";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const { id } = await params;

  const version = await prisma.resumeVersion.findFirst({
    where: { id, resume: { userId: session.user.id } },
    select: { id: true },
  });

  if (!version) {
    return apiError("VERSION_NOT_FOUND");
  }

  await prisma.resumeVersion.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
