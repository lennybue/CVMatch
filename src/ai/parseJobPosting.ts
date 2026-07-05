import { generateStructured } from "./client";
import { JobPostingDataSchema, type JobPostingData } from "@/types/cv";

const SYSTEM_PROMPT = `You extract structured requirements from a job posting.
Rules:
- Only extract information that is literally present or clearly implied by the posting text.
- Distinguish must-have (explicitly required) skills from nice-to-have (preferred/bonus) skills.
- Keywords should include important terms an ATS system would scan for (tools, technologies, certifications, methodologies, role-specific terminology).
- Do not invent requirements that are not in the text.`;

export async function parseJobPostingFromText(
  rawText: string,
): Promise<JobPostingData> {
  return generateStructured({
    schema: JobPostingDataSchema,
    toolName: "extract_job_posting_data",
    system: SYSTEM_PROMPT,
    prompt: `Extract structured requirements from this job posting:\n\n---\n${rawText}\n---`,
    maxTokens: 2048,
  });
}
