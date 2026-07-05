import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { optimizeCv } from "@/ai/optimizeCv";
import { analyzeMatch } from "@/ai/analyze";
import {
  AnalysisResultSchema,
  CvDataSchema,
  JobPostingDataSchema,
} from "@/types/cv";
import { apiError } from "@/lib/apiError";
import { DEFAULT_PRESENTATION, PresentationSchema } from "@/types/presentation";

const OptimizeRequestSchema = z.object({
  analysisId: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHORIZED");
  }

  const body = await request.json().catch(() => null);
  const parsed = OptimizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR");
  }

  const analysis = await prisma.aIAnalysis.findFirst({
    where: {
      id: parsed.data.analysisId,
      resume: { userId: session.user.id },
    },
    include: { resume: true, jobPosting: true },
  });

  if (!analysis) {
    return apiError("ANALYSIS_NOT_FOUND");
  }

  const cv = CvDataSchema.parse(analysis.resume.structuredData);
  const job = JobPostingDataSchema.parse(analysis.jobPosting.structuredData);
  const analysisResult = AnalysisResultSchema.parse({
    matchScore: analysis.matchScore,
    atsScore: analysis.atsScore,
    matchingSkills: analysis.matchingSkills,
    missingSkills: analysis.missingSkills,
    keywordAnalysis: analysis.keywordAnalysis,
    suggestions: analysis.suggestions,
  });

  const latestVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId: analysis.resumeId },
    orderBy: { createdAt: "desc" },
    select: { presentation: true },
  });
  const presentation = latestVersion?.presentation
    ? PresentationSchema.parse(latestVersion.presentation)
    : DEFAULT_PRESENTATION;

  let optimized;
  try {
    optimized = await optimizeCv(cv, job, analysisResult);
  } catch (error) {
    console.error("Optimization failed", error);
    return apiError("AI_OPTIMIZATION_FAILED");
  }

  // Re-score the optimized resume against the same posting so the version
  // reflects its own (improved) scores rather than the pre-optimization ones.
  let postOptimizationScore = { matchScore: analysis.matchScore, atsScore: analysis.atsScore };
  try {
    postOptimizationScore = await analyzeMatch(optimized, job);
  } catch (error) {
    console.error("Post-optimization scoring failed, falling back to prior scores", error);
  }

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: analysis.resumeId,
      jobPostingId: analysis.jobPostingId,
      analysisId: analysis.id,
      source: "AI_OPTIMIZED",
      isOriginal: false,
      structuredData: optimized,
      presentation,
      atsScore: postOptimizationScore.atsScore,
      matchScore: postOptimizationScore.matchScore,
    },
  });

  return NextResponse.json({ version }, { status: 201 });
}
