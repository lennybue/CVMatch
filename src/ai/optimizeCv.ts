import { generateStructured } from "./client";
import { CvDataSchema, type CvData, type JobPostingData, type AnalysisResult } from "@/types/cv";

const SYSTEM_PROMPT = `You rewrite a candidate's resume to better match a specific job posting.

You will receive the candidate's ORIGINAL structured resume data, the job posting requirements, and a
prior gap analysis. You must return a complete, optimized version of the SAME resume structure.

STRICT RULES — violating any of these is a critical failure:
1. NEVER invent work experience, employers, job titles, dates, degrees, certificates, or projects that are
   not present in the original resume.
2. NEVER add a skill the candidate did not already list or that is not clearly evidenced by their existing
   bullet points. You may surface an already-implied skill more explicitly (e.g. if a bullet already
   describes container orchestration, you may add "Docker" to skills only if Docker is literally mentioned
   in that bullet already), but you may not introduce technologies/skills absent from the source material.
3. NEVER fabricate metrics, numbers, or outcomes. You may highlight a measurable result ONLY if that number
   already exists somewhere in the original text.
4. Every employer, job title, institution, date range, and certificate name must be copied verbatim from the
   original — you may not alter facts, only wording/order/emphasis.

WHAT YOU MAY DO:
- Rewrite the summary to be sharper and more targeted at this specific role, using only facts from the resume.
- Reorder skills so the most job-relevant ones (that the candidate genuinely has) appear first.
- Rewrite bullet points to be stronger, more concise, and more action-oriented, and to naturally incorporate
  ATS keywords from the job posting WHERE those keywords accurately describe what the bullet already says.
- Reorder experience/education entries if it improves relevance (but keep overall reverse-chronological order
  within each section, since ATS systems expect chronological resumes).
- Lightly adjust the phrasing of a job title to a more standard/recognizable equivalent ONLY if it is a
  reasonable synonym of the original title (e.g. "Software Engineer II" and "Senior Software Engineer" are not
  interchangeable — do not do this if it would misrepresent seniority).

Return the full resume structure, including every original section, even fields you did not change.`;

export async function optimizeCv(
  cv: CvData,
  job: JobPostingData,
  analysis: AnalysisResult,
): Promise<CvData> {
  return generateStructured({
    schema: CvDataSchema,
    toolName: "submit_optimized_resume",
    system: SYSTEM_PROMPT,
    prompt: `ORIGINAL RESUME (structured):\n${JSON.stringify(cv, null, 2)}\n\nJOB POSTING (structured):\n${JSON.stringify(job, null, 2)}\n\nGAP ANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n\nProduce the optimized resume now.`,
    maxTokens: 4096,
  });
}
