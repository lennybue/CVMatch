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

  const analysis = await prisma.aIAnalysis.findFirst({
    where: { id, resume: { userId: session.user.id } },
    select: { id: true },
  });

  if (!analysis) {
    return apiError("ANALYSIS_NOT_FOUND");
  }

  await prisma.aIAnalysis.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
