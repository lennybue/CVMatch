import { generateStructured } from "./client";
import {
  AnalysisResultSchema,
  type AnalysisResult,
  type CvData,
  type JobPostingData,
} from "@/types/cv";

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and technical recruiter.
You compare a candidate's resume against a job posting and produce an honest, calibrated assessment.

Scoring guidance:
- matchScore (0-100): overall fit between the candidate's real, demonstrated experience/skills and the job's requirements.
- atsScore (0-100): how well the resume's current wording/structure would score when parsed by an automated ATS keyword scanner (keyword coverage, standard section naming, absence of parsing hazards).
- Be honest and calibrated. Do not inflate scores. A resume missing most must-have skills should score low.
- matchingSkills: skills/technologies present in the resume that also appear in the job posting.
- missingSkills: must-have or nice-to-have skills from the job posting that are NOT evidenced anywhere in the resume.
- keywordAnalysis: which ATS-relevant keywords from the job posting are covered vs missing in the resume text.
- suggestions: concrete, actionable improvements (e.g. "Add the keyword 'Kubernetes' to your skills section since you describe container orchestration work in your Acme Corp role", "Quantify the impact of the migration project in your second bullet"). Never suggest inventing experience the candidate doesn't have.`;

export async function analyzeMatch(
  cv: CvData,
  job: JobPostingData,
): Promise<AnalysisResult> {
  return generateStructured({
    schema: AnalysisResultSchema,
    toolName: "submit_analysis",
    system: SYSTEM_PROMPT,
    prompt: `CANDIDATE RESUME (structured):\n${JSON.stringify(cv, null, 2)}\n\nJOB POSTING (structured):\n${JSON.stringify(job, null, 2)}\n\nAnalyze the match and submit your assessment.`,
    maxTokens: 3072,
  });
}
