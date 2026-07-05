import { z } from "zod";

export const ContactSchema = z.object({
  fullName: z.string(),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      }),
    )
    .default([]),
});

export const ExperienceEntrySchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const EducationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  details: z.array(z.string()).default([]),
});

export const CertificateSchema = z.object({
  name: z.string(),
  issuer: z.string().optional().default(""),
  date: z.string().optional().default(""),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  bullets: z.array(z.string()).default([]),
  link: z.string().optional().default(""),
});

export const LanguageSchema = z.object({
  name: z.string(),
  level: z.string().optional().default(""),
});

export const CvDataSchema = z.object({
  contact: ContactSchema,
  summary: z.string().optional().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  certificates: z.array(CertificateSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
});

export type CvData = z.infer<typeof CvDataSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;

export const JobPostingDataSchema = z.object({
  jobTitle: z.string().optional().default(""),
  company: z.string().optional().default(""),
  seniorityLevel: z.string().optional().default(""),
  mustHaveSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type JobPostingData = z.infer<typeof JobPostingDataSchema>;

export const AnalysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  keywordAnalysis: z.object({
    coveredKeywords: z.array(z.string()).default([]),
    missingKeywords: z.array(z.string()).default([]),
  }),
  suggestions: z.array(z.string()).default([]),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
