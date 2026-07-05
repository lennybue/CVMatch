import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJobPostingFromText } from "@/ai/parseJobPosting";
import { apiError } from "@/lib/apiError";

const CreateJobPostingSchema = z.object({
  rawText: z.string().min(50),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateJobPostingSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("JOB_POSTING_TEXT_TOO_SHORT");
  }

  let structuredData;
  try {
    structuredData = await parseJobPostingFromText(parsed.data.rawText);
  } catch (error) {
    console.error("Job posting parsing failed", error);
    return apiError("AI_PARSING_FAILED");
  }

  const jobPosting = await prisma.jobPosting.create({
    data: {
      userId: session.user.id,
      title: structuredData.jobTitle || null,
      company: structuredData.company || null,
      rawText: parsed.data.rawText,
      structuredData,
    },
  });

  return NextResponse.json({ jobPosting }, { status: 201 });
}
