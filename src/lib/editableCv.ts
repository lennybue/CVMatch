import type {
  CvData,
  ExperienceEntry,
  EducationEntry,
} from "@/types/cv";

export interface IdItem<T> {
  id: string;
  value: T;
}

// Deterministic (index-based) rather than crypto.randomUUID(): this runs
// inside a useState initializer, which React invokes once during the
// server render and again during client hydration. Random ids would differ
// between those two passes and break dnd-kit's SSR-hydration id matching.
function withIds<T>(prefix: string, values: T[]): IdItem<T>[] {
  return values.map((value, index) => ({ id: `${prefix}-${index}`, value }));
}

function stripIds<T>(items: IdItem<T>[]): T[] {
  return items.map((item) => item.value);
}

export interface EditableExperience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: IdItem<string>[];
}

export interface EditableEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  details: IdItem<string>[];
}

export interface EditableProject {
  name: string;
  description: string;
  link: string;
  bullets: IdItem<string>[];
}

export interface EditableCv {
  contact: CvData["contact"];
  summary: string;
  skills: IdItem<string>[];
  experience: IdItem<EditableExperience>[];
  education: IdItem<EditableEducation>[];
  projects: IdItem<EditableProject>[];
  certificates: IdItem<CvData["certificates"][number]>[];
  languages: IdItem<CvData["languages"][number]>[];
}

export function toEditableCv(cv: CvData): EditableCv {
  return {
    contact: cv.contact,
    summary: cv.summary,
    skills: withIds("skill", cv.skills),
    experience: withIds(
      "experience",
      cv.experience.map(
        (exp, i): EditableExperience => ({
          ...exp,
          bullets: withIds(`experience-${i}-bullet`, exp.bullets),
        }),
      ),
    ),
    education: withIds(
      "education",
      cv.education.map(
        (edu, i): EditableEducation => ({
          ...edu,
          details: withIds(`education-${i}-detail`, edu.details),
        }),
      ),
    ),
    projects: withIds(
      "project",
      cv.projects.map(
        (project, i): EditableProject => ({
          ...project,
          bullets: withIds(`project-${i}-bullet`, project.bullets),
        }),
      ),
    ),
    certificates: withIds("certificate", cv.certificates),
    languages: withIds("language", cv.languages),
  };
}

export function fromEditableCv(editable: EditableCv): CvData {
  return {
    contact: editable.contact,
    summary: editable.summary,
    skills: stripIds(editable.skills),
    experience: stripIds(editable.experience).map(
      (exp): ExperienceEntry => ({
        ...exp,
        bullets: stripIds(exp.bullets),
      }),
    ),
    education: stripIds(editable.education).map(
      (edu): EducationEntry => ({
        ...edu,
        details: stripIds(edu.details),
      }),
    ),
    projects: stripIds(editable.projects).map((project) => ({
      ...project,
      bullets: stripIds(project.bullets),
    })),
    certificates: stripIds(editable.certificates),
    languages: stripIds(editable.languages),
  };
}

export function newId(): string {
  return crypto.randomUUID();
}
