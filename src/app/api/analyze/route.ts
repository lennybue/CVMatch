import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeMatch } from "@/ai/analyze";
import { CvDataSchema, JobPostingDataSchema } from "@/types/cv";
import { apiError } from "@/lib/apiError";

const AnalyzeRequestSchema = z.object({
  resumeId: z.string(),
  jobPostingId: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const body = await request.json().catch(() => null);
  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR");
  }

  const [resume, jobPosting] = await Promise.all([
    prisma.resume.findFirst({
      where: { id: parsed.data.resumeId, userId: session.user.id },
    }),
    prisma.jobPosting.findFirst({
      where: { id: parsed.data.jobPostingId, userId: session.user.id },
    }),
  ]);

  if (!resume) {
    return apiError("RESUME_NOT_FOUND");
  }
  if (!jobPosting) {
    return apiError("JOB_POSTING_NOT_FOUND");
  }

  const cv = CvDataSchema.parse(resume.structuredData);
  const job = JobPostingDataSchema.parse(jobPosting.structuredData);

  let result;
  try {
    result = await analyzeMatch(cv, job);
  } catch (error) {
    console.error("Analysis failed", error);
    return apiError("AI_ANALYSIS_FAILED");
  }

  const analysis = await prisma.aIAnalysis.create({
    data: {
      resumeId: resume.id,
      jobPostingId: jobPosting.id,
      matchScore: result.matchScore,
      atsScore: result.atsScore,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills,
      keywordAnalysis: result.keywordAnalysis,
      suggestions: result.suggestions,
    },
  });

  return NextResponse.json({ analysis }, { status: 201 });
}
