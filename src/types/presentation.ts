import { z } from "zod";

export const RESUME_SECTION_KEYS = [
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certificates",
  "languages",
] as const;

export type ResumeSectionKey = (typeof RESUME_SECTION_KEYS)[number];

export const TEMPLATES = ["modern", "compact"] as const;
export type Template = (typeof TEMPLATES)[number];

export const FONT_FAMILIES = ["Helvetica", "Times-Roman", "Courier"] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

export const PresentationSchema = z.object({
  template: z.enum(TEMPLATES).default("modern"),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2563eb"),
  fontFamily: z.enum(FONT_FAMILIES).default("Helvetica"),
  sectionOrder: z.array(z.enum(RESUME_SECTION_KEYS)).default([...RESUME_SECTION_KEYS]),
});

export type Presentation = z.infer<typeof PresentationSchema>;

export const DEFAULT_PRESENTATION: Presentation = {
  template: "modern",
  accentColor: "#2563eb",
  fontFamily: "Helvetica",
  sectionOrder: [...RESUME_SECTION_KEYS],
};

export const ACCENT_COLOR_SWATCHES = [
  "#2563eb",
  "#0f172a",
  "#16a34a",
  "#b91c1c",
  "#7c3aed",
  "#0891b2",
] as const;
