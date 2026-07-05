import { generateStructured } from "./client";
import { CvDataSchema, type CvData } from "@/types/cv";

const SYSTEM_PROMPT = `You extract structured resume/CV data from raw text.
Rules:
- Only extract information that is literally present in the source text.
- Never invent, infer, or embellish job titles, dates, employers, skills, or achievements.
- If a field is not present in the text, leave it empty (empty string or empty array).
- Preserve the original wording of bullet points; do not rewrite them.
- Dates should be kept in whatever format the source uses (e.g. "2019", "Jan 2020", "2020-01").`;

export async function parseCvFromText(rawText: string): Promise<CvData> {
  return generateStructured({
    schema: CvDataSchema,
    toolName: "extract_cv_data",
    system: SYSTEM_PROMPT,
    prompt: `Extract structured data from this resume text:\n\n---\n${rawText}\n---`,
    maxTokens: 4096,
  });
}
